import Link from "next/link";
import { _APP_NAME_ABBR } from "@/constants";
import { ModeToggle } from "./ModeToggle.client";
import { UserProfile } from "./UserProfile.client";

const Header = () => (
  <header className='z-20 border-b-2 shadow-md'>
    <div className='container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-4 md:flex-row'>
      <div className='flex items-center font-bold text-xl uppercase'>
        <Link href='/' prefetch={true}>
          {_APP_NAME_ABBR}
        </Link>
      </div>
      <div className='flex items-center gap-2'>
        {/* <Link
          className='mr-0 font-medium text-muted-foreground text-sm transition-colors hover:text-primary'
          href='/api-docs'
        >
          API Docs
        </Link> */}
        <ModeToggle />
        <UserProfile />
      </div>
    </div>
  </header>
);

export { Header };
