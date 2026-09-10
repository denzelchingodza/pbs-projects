/**
 * Real leadership team. Rebuilt as two matching cards side by side instead
 * of stacked, alternating rows, direct feedback was that the old layout
 * (one giant portrait per row, a huge faint initials monogram floating
 * behind the name, the role shown as a small colored pill) read as an
 * AI-generated template rather than two real people who run this
 * business. Both people now sit in the same row, in the same card shape,
 * the photo uses the same `photo-frame` + `FrameCorners` treatment as
 * every other real photo on the site (was its own one-off "framed print"
 * style before), and the role is just plain text under the name, not a
 * badge.
 *
 * Photos live in public/images/team/. Until a given member's photo file is
 * actually supplied, their spot falls back to a plain initials panel, so
 * the page never shows a broken image.
 */
import Image from "next/image";
import SectionHeading from "@/components/ui/SectionHeading";
import FrameCorners from "@/components/ui/FrameCorners";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  photo?: string; // path in public/images/team/, once supplied
}

const TEAM: TeamMember[] = [
  {
    name: "Panashe Simbi",
    role: "CEO",
    bio: "Leads PBS Projects' overall direction and client relationships, making sure every job, from the first quote to the final install, reflects the standard the business is built on.",
    photo: "/images/team/panashe-simbi.jpg",
  },
  {
    name: "Herbert Matembunze",
    role: "Operations Manager",
    bio: "Runs the day to day of every project, scheduling, materials, and the installation team, so each job stays on track and on time from start to finish.",
    photo: "/images/team/herbert-matembunze.jpg",
  },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function TeamCard({ member }: { member: TeamMember }) {
  return (
    <div className="bg-white border border-neutral-200/70 rounded-2xl p-6 sm:p-7">
      <div className="photo-frame shine-hover relative aspect-[4/5] rounded-xl overflow-hidden bg-neutral-100">
        {member.photo ? (
          <Image
            src={member.photo}
            alt={`${member.name}, ${member.role} at PBS Projects`}
            fill
            sizes="(max-width: 640px) 100vw, 340px"
            className="object-cover object-top"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-3xl font-semibold text-dark/30">
            {initials(member.name)}
          </div>
        )}
        <FrameCorners />
      </div>

      <h3 className="mt-5 font-semibold text-dark text-xl tracking-tight">{member.name}</h3>
      <p className="text-neutral-500 text-sm mt-0.5">{member.role}</p>
      <p className="mt-3 text-neutral-600 text-sm leading-relaxed">{member.bio}</p>
    </div>
  );
}

export default function TeamSection() {
  return (
    <section className="px-6 md:px-8 py-20 bg-paper">
      <div className="max-w-4xl mx-auto">
        <SectionHeading eyebrow="Leadership" title="Meet the Team" />
        <div className="grid sm:grid-cols-2 gap-6">
          {TEAM.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
