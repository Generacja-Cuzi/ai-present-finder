import { FaGithub, FaLinkedin } from "react-icons/fa";

import { buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface TeamProps {
  imageUrl: string;
  name: string;
  position: string;
  description: string;
  socialNetworks: SociaNetworksProps[];
}

interface SociaNetworksProps {
  platform: string;
  url: string;
}

const teamList: TeamProps[] = [
  {
    imageUrl: "/dawid.jpg",
    name: "Dawid Chudzicki",
    position: "Fullstack Developer",
    description: "Pasjonat programowania tworzący innowacyjne rozwiązania.",
    socialNetworks: [
      {
        platform: "Linkedin",
        url: "https://www.linkedin.com/in/dawid-chudzicki-34aa8032a/",
      },
      {
        platform: "GitHub",
        url: "https://github.com/unewMe",
      },
    ],
  },
  {
    imageUrl: "/marcin.jpg",
    name: "Marcin Dolatowski",
    position: "Fullstack Developer",
    description: "Pasjonat programowania tworzący innowacyjne rozwiązania.",
    socialNetworks: [
      {
        platform: "Linkedin",
        url: "https://www.linkedin.com/in/marcin-dolatowski-183104248/",
      },
      {
        platform: "GitHub",
        url: "https://github.com/D0dii",
      },
    ],
  },
  {
    imageUrl: "/bartek.jpg",
    name: "Bartosz Gotowski",
    position: "Fullstack Developer",
    description: "Pasjonat programowania tworzący innowacyjne rozwiązania.",
    socialNetworks: [
      {
        platform: "Linkedin",
        url: "https://www.linkedin.com/in/bartosz-gotowski/",
      },
      {
        platform: "GitHub",
        url: "https://github.com/Rei-x",
      },
    ],
  },
  {
    imageUrl: "/szymon.jpg",
    name: "Szymon Kowaliński",
    position: "Fullstack Developer",
    description: "Pasjonat programowania tworzący innowacyjne rozwiązania.",
    socialNetworks: [
      {
        platform: "Linkedin",
        url: "https://www.linkedin.com/in/kowdev/",
      },
      {
        platform: "GitHub",
        url: "https://github.com/simon-the-shark",
      },
    ],
  },
];

export function Team() {
  const socialIcon = (iconName: string) => {
    switch (iconName) {
      case "Linkedin": {
        return <FaLinkedin />;
      }
      case "GitHub": {
        return <FaGithub />;
      }
      default: {
        return null;
      }
    }
  };

  return (
    <section id="team" className="container py-8 sm:py-12">
      <h2 className="text-3xl font-bold md:text-4xl">
        <span className="from-primary/60 to-primary bg-gradient-to-b bg-clip-text text-transparent">
          Nasz zaangażowany{" "}
        </span>
        zespół
      </h2>

      <p className="text-muted-foreground mb-10 mt-4 text-xl">
        Poznaj nasz zespół pasjonatów programowania, którzy tworzą innowacyjne
        rozwiązania napędzane AI.
      </p>

      <div className="grid gap-8 gap-y-10 md:grid-cols-2 lg:grid-cols-4">
        {teamList.map(
          ({
            imageUrl,
            name,
            position,
            description,
            socialNetworks,
          }: TeamProps) => (
            <Card
              key={name}
              className="bg-muted/50 relative mt-8 flex flex-col items-center justify-center"
            >
              <CardHeader className="mt-8 flex w-full flex-col items-center justify-center pb-2">
                <img
                  src={imageUrl}
                  alt={`${name} ${position}`}
                  className="absolute -top-12 aspect-square h-24 w-24 rounded-full object-cover"
                />
                <CardTitle className="text-center">{name}</CardTitle>
                <CardDescription className="text-primary">
                  {position}
                </CardDescription>
              </CardHeader>

              <CardContent className="pb-2 text-center">
                <p>{description}</p>
              </CardContent>

              <CardFooter>
                {socialNetworks.map(({ platform, url }: SociaNetworksProps) => (
                  <div key={platform}>
                    <a
                      rel="noreferrer noopener"
                      href={url}
                      target="_blank"
                      className={buttonVariants({
                        variant: "ghost",
                        size: "sm",
                      })}
                    >
                      <span className="sr-only">{platform} icon</span>
                      {socialIcon(platform)}
                    </a>
                  </div>
                ))}
              </CardFooter>
            </Card>
          ),
        )}
      </div>
    </section>
  );
}
