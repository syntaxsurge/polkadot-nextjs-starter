import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface NavItem {
  title: string;
  items: { title: string; href: string }[];
}

interface NavMobileProps {
  items: NavItem[];
}

export function NavMobile({ items }: NavMobileProps) {
  return (
    <div className="flex flex-col pb-6">
      <div className="flex flex-col">
        {items.map((item, index) => (
          <div key={index} className="flex flex-col">
            <div className="px-6 py-4 font-medium text-foreground">
              {item.title}
            </div>
            <div className="px-6 pb-4">
              <div className="flex flex-col space-y-3 pl-2">
                {item.items.map((subItem) => (
                  <Link
                    key={subItem.title}
                    href={subItem.href}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {subItem.title}
                  </Link>
                ))}
              </div>
            </div>
            {index < items.length - 1 && <Separator />}
          </div>
        ))}
      </div>
      <div className="px-6 pt-2">
        <Button className="w-full" size="lg">
          Get Started
        </Button>
      </div>
    </div>
  );
}
