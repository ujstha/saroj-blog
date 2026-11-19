import { cn } from "@/utils/cn";

export const Section = ({ children, className }) => {
  return (
    <section className={cn("px-4 py-8 sm:px-6 sm:py-10 md:py-14", className)}>
      {children}
    </section>
  );
};
