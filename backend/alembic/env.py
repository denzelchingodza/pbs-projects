# Alembic migration environment.
# Imports the SQLAlchemy Base + models so `alembic revision --autogenerate` works.
from app.database import Base
from app.config import settings
# from app.models import product, project, quote, user, testimonial  # noqa

target_metadata = Base.metadata
