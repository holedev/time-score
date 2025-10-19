import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { UserWithRole } from "@/types/global";
import { getRoleName } from "@/utils";

const Profile = async ({ user }: { user: UserWithRole }) => (
  <Card>
    <CardHeader>
      <CardTitle className='font-bold text-xl uppercase'>Thông tin</CardTitle>
      <CardDescription className='text-muted-foreground'>Thông tin cá nhân của người dùng</CardDescription>
    </CardHeader>
    <CardContent className='space-y-4'>
      <div className='flex items-center space-x-4'>
        <Avatar className='h-20 w-20'>
          <AvatarImage alt={user?.user_metadata.full_name} src={user?.user_metadata.avatar_url || "/default-avt.jpg"} />
          <AvatarFallback>{user?.user_metadata.full_name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div>
          <h5 className='font-bold text-xl'>{getRoleName(user?.userRole)}</h5>
          <p className='text-muted-foreground'>{user?.email}</p>
        </div>
      </div>
    </CardContent>
  </Card>
);

export { Profile };
