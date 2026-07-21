"""Projects become jobs with multiple photos, testimonials get a status

Before this, every uploaded photo was its own "project" row, one real job
with 3 photos on site showed up as 3 separate, unrelated gallery entries.
This splits that into two tables: `projects` is now the job itself (title,
category, featured flag), `project_media` holds the actual photos/videos,
one job can have one or several. The 88 real job photos already in the
database get regrouped here too, using the same-site groupings worked out
by eye when they were uploaded (see docs/BUILD_LOG.md Stage 13), so nothing
gets lost or re-uploaded, it just moves into the right shape.

Also adds `testimonials.status`, real customers can now submit their own
testimonial through the site, and it needs to sit as "pending" until the
admin approves it, existing seeded testimonials are backfilled to
"approved" so they keep showing.

Revision ID: b7f3d2a19c40
Revises: aed0cb5089bc
Create Date: 2026-07-22 09:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = 'b7f3d2a19c40'
down_revision = 'aed0cb5089bc'
branch_labels = None
depends_on = None

# Each inner list is photos (by their current `projects.id`, since every
# photo was its own project row before this migration) that are actually
# the same job site. The first id in each group keeps its project row,
# the rest hand their photo over to project_media and then get deleted as
# projects. Anything not listed here (most of the 88) was a confident,
# standalone match and stays a one photo project.
SAME_SITE_GROUPS = [
    [1, 2, 3],
    [5, 6],
    [7, 8],
    [10, 11],
    [13, 14],
    [15, 16],
    [19, 20],
    [23, 24],
    [27, 28],
    [30, 31],
    [40, 41],
    [44, 45],
    [59, 60, 61, 62],
    [65, 66, 67],
    [69, 70],
    [72, 73],
    [80, 81],
    [87, 88],
]


def upgrade() -> None:
    bind = op.get_bind()

    op.create_table(
        'project_media',
        sa.Column('id', sa.Integer(), primary_key=True, index=True),
        sa.Column(
            'project_id',
            sa.Integer(),
            sa.ForeignKey('projects.id', ondelete='CASCADE'),
            nullable=False,
            index=True,
        ),
        sa.Column('image_url', sa.String(), nullable=False),
        sa.Column('media_type', sa.String(), nullable=False, server_default='image'),
        sa.Column('position', sa.Integer(), nullable=False, server_default='0'),
        sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()),
    )

    # Pull every existing project's single photo out before the old columns
    # get dropped below, keyed by id so we know which photo belonged to
    # which original project row.
    rows = bind.execute(sa.text('SELECT id, image_url, media_type FROM projects')).fetchall()
    media_by_id = {row.id: (row.image_url, row.media_type) for row in rows}

    insert_media = sa.text(
        'INSERT INTO project_media (project_id, image_url, media_type, position) '
        'VALUES (:project_id, :image_url, :media_type, :position)'
    )

    grouped_ids: set[int] = set()
    for group in SAME_SITE_GROUPS:
        canonical = group[0]
        for position, pid in enumerate(group):
            grouped_ids.add(pid)
            image_url, media_type = media_by_id[pid]
            bind.execute(
                insert_media,
                {"project_id": canonical, "image_url": image_url, "media_type": media_type, "position": position},
            )

    # Anything not part of a group above just moves its one photo across as-is.
    for pid, (image_url, media_type) in media_by_id.items():
        if pid not in grouped_ids:
            bind.execute(
                insert_media,
                {"project_id": pid, "image_url": image_url, "media_type": media_type, "position": 0},
            )

    # The non-canonical ids in each group are now redundant project rows,
    # their photo lives in project_media under the canonical id instead.
    extra_ids = [pid for group in SAME_SITE_GROUPS for pid in group[1:]]
    if extra_ids:
        placeholders = ','.join(str(i) for i in extra_ids)
        bind.execute(sa.text(f'DELETE FROM projects WHERE id IN ({placeholders})'))

    # image_url/media_type now live on project_media, not projects.
    with op.batch_alter_table('projects') as batch_op:
        batch_op.add_column(sa.Column('created_at', sa.DateTime(), server_default=sa.func.now()))
        batch_op.drop_column('image_url')
        batch_op.drop_column('media_type')

    # Real customers can submit a testimonial now, it needs a moderation
    # state. Existing (seeded) testimonials are trusted content already,
    # so they're backfilled straight to approved.
    with op.batch_alter_table('testimonials') as batch_op:
        batch_op.add_column(sa.Column('status', sa.String(), nullable=False, server_default='pending'))
    bind.execute(sa.text("UPDATE testimonials SET status = 'approved'"))


def downgrade() -> None:
    bind = op.get_bind()

    with op.batch_alter_table('testimonials') as batch_op:
        batch_op.drop_column('status')

    with op.batch_alter_table('projects') as batch_op:
        batch_op.add_column(sa.Column('image_url', sa.String(), nullable=False, server_default=''))
        batch_op.add_column(sa.Column('media_type', sa.String(), nullable=False, server_default='image'))
        batch_op.drop_column('created_at')

    # Best effort only: restores each project's first photo onto the
    # project row itself, any extra photos in a merged job are dropped
    # rather than re-expanded back into their own separate project rows.
    rows = bind.execute(
        sa.text('SELECT project_id, image_url, media_type FROM project_media WHERE position = 0')
    ).fetchall()
    for row in rows:
        bind.execute(
            sa.text('UPDATE projects SET image_url = :image_url, media_type = :media_type WHERE id = :id'),
            {"image_url": row.image_url, "media_type": row.media_type, "id": row.project_id},
        )

    op.drop_table('project_media')
