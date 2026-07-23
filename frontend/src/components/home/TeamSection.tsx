/**
 * Real leadership team, shown on the About page. Replaces the generic
 * "Meet the Founder" placeholder (AboutFounder.tsx, kept around unused for
 * now rather than deleted, in case it's wanted again later) now that there
 * are two real, named people to show instead of an unfilled single bio.
 *
 * Each card shows the full, uncropped photo (real on-site shots in PBS
 * branded workwear) beside the name, role, and bio, stacked below on
 * mobile. This replaced an earlier version that cropped the photo into a
 * small circle above the text, which threw away most of the photo and the
 * branded uniform/work site context that makes it worth showing in full.
 *
 * Photos live in public/images/team/. Until a given member's photo file is
 * actually supplied, their card falls back to the same initials badge the
 * founder section used, so the page never shows a broken image.
 */
import Image from "next/image";

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
    <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow sm:flex">
      {member.photo ? (
        <div className="relative w-full sm:w-48 aspect-[4/5] sm:aspect-auto shrink-0">
          <Image
            src={member.photo}
            alt={`${member.name}, ${member.role} at PBS Projects`}
            fill
            sizes="(max-width: 640px) 100vw, 192px"
            className="object-cover object-top"
          />
        </div>
      ) : (
        <div className="w-full sm:w-48 aspect-[4/5] sm:aspect-auto shrink-0 bg-dark text-white flex items-center justify-center text-3xl font-bold">
          {initials(member.name)}
        </div>
      )}
      <div className="p-6 flex flex-col justify-center">
        <h3 className="font-bold text-dark text-lg">{member.name}</h3>
        <p className="text-orange text-xs font-semibold uppercase tracking-widest mt-1">{member.role}</p>
        <p className="text-neutral-600 text-sm leading-relaxed mt-3">{member.bio}</p>
      </div>
    </div>
  );
}

export default function TeamSection() {
  return (
    <section className="px-6 md:px-8 py-20 bg-white">
      <div className="max-w-4xl mx-auto">
        <p className="text-orange text-xs font-semibold uppercase tracking-[0.2em] mb-3 text-center">
          Leadership
        </p>
        <h2 className="text-2xl sm:text-3xl font-bold text-dark tracking-tight text-center mb-10">
          Meet the Team
        </h2>
        <div className="grid gap-6 max-w-2xl mx-auto">
          {TEAM.map((member) => (
            <TeamCard key={member.name} member={member} />
          ))}
        </div>
      </div>
    </section>
  );
}
