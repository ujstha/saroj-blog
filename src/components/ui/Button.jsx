import { socialMedias } from "@/constants";
import Link from "next/link";
import { CustomImage } from "./CustomImage";

export const SocialButtons = () => {
  return (
    <div className="mt-4 flex flex-wrap gap-3 py-1">
      {socialMedias.map(({ title, href }) => (
        <Link
          key={title}
          href={href}
          target="_blank"
          className="border-primary/10 bg-background/90 animation hover:border-accent1/25 flex size-11 items-center justify-center rounded-2xl border shadow-[inset_0_1px_0_rgba(255,255,255,0.45)] hover:-translate-y-1 hover:shadow-[0_14px_26px_rgba(10,18,28,0.1)]"
        >
          <CustomImage
            src={`/assets/icons/${title}.svg`}
            alt={title}
            className="!w-5 bg-transparent md:!w-6"
          />
        </Link>
      ))}
    </div>
  );
};
