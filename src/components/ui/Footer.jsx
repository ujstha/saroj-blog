import { Container, Logo, SocialButtons } from ".";

export const Footer = () => {
  return (
    <footer className="bg-accent1-5">
      <Container className="grid place-content-center py-8">
        <div className="mb-4 flex flex-col items-center">
          <Logo />
          <p className="mt-1 font-medium">The Man on a Mission</p>
        </div>
        <SocialButtons />
      </Container>
      <Container className="rounded-t-2xl py-1 text-center bg-background-80">
            <div className="flex flex-col items-center">
              <span className="text-sm">Copyright &copy; 2024. Saroj Bartaula.</span>
              <a
                href="https://milkywaymarket.shop/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 text-sm text-accent1 underline"
              >
                Shop at Milky Way Market
              </a>
            </div>
      </Container>
    </footer>
  );
};
