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
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D4D03AQHH1ttU04oa8Q/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1726961344926?e=1764201600&v=beta&t=1z4zhTN3T2opGwFrRhPK6naGzA8tSXFNY_u0vMi02us",
    name: "Dawid Chudzicki",
    position: "Fullstack Developer",
    description: "Passionate programmer building innovative solutions.",
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
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D4D03AQFMrh4hIOuUWw/profile-displayphoto-scale_400_400/B4DZkKNJaSHYAk-/0/1756812844850?e=1764201600&v=beta&t=ESoMh7ClHPQdcNXpxBjym_uP7BB4GRmXuw1pNyLBeOk",
    name: "Marcin Dolatowski",
    position: "Fullstack Developer",
    description: "Passionate programmer building innovative solutions.",
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
    imageUrl:
      "https://media.licdn.com/dms/image/v2/C4E03AQHDsr7aer_sig/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1656863838670?e=1764201600&v=beta&t=AEvRwWM6Gar0iPE9kbglr6UzSN4qoguEHIWf2wq8xf0",
    name: "Bartosz Gotowski",
    position: "Fullstack Developer",
    description: "Passionate programmer building innovative solutions.",
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
    imageUrl:
      "https://media.licdn.com/dms/image/v2/D4E03AQFFBUoNyWJrsw/profile-displayphoto-shrink_400_400/profile-displayphoto-shrink_400_400/0/1712598996898?e=1764201600&v=beta&t=7O73tzo23AhhUBz90Es1ac4euSAzOxKPbPU7KohGwj8",
    name: "Szymon Kowaliński",
    position: "Fullstack Developer",
    description: "Passionate programmer building innovative solutions.",
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
    }
  };

  return (
    <section id="team" className="container py-24 sm:py-32">
      <h2 className="text-3xl font-bold md:text-4xl">
        <span className="from-primary/60 to-primary bg-gradient-to-b bg-clip-text text-transparent">
          Our Dedicated{" "}
        </span>
        Crew
      </h2>

      <p className="text-muted-foreground mb-10 mt-4 text-xl">
        Meet our team of passionate programmers dedicated to building innovative
        AI-powered solutions.
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
