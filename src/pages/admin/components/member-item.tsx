import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Member } from "@/http/fetch-channel-members";
import { authSlice } from "@/store/auth";
import { Crown } from "lucide-react";

type MemberItemProps = {
  data: Member
  connected?: boolean
};


export function MemberItem({ data, connected }: MemberItemProps) {
  const { auth } = authSlice(state => state)


  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={`flex items-center space-x-2 text-sm}`}>
          <div className='flex flex-1 items-center space-x-2'>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.member?.name}`}
              alt={data.member.name}
              className={`w-8 h-8 rounded-full border-2 ${connected ? 'border-green-500' : 'border-red-500'} shadow-sm `}
            />

            <span className={`truncate capitalize ${auth.user.id === data.memberId ? 'text-green-500 animate-pulse' : ''}`}>{data.member.name}</span>
          </div>
          {data.role === 'ADMIN' && (
            <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do membro</DialogTitle>
        </DialogHeader>
        <div className="mt-4 w-full flex flex-col justify-center items-center space-y-2">
          {data.role === 'ADMIN' && (
            <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
          )}
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.member.name}`} alt={data.member.name} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <DialogDescription>
            {data.member.name}
          </DialogDescription>
          <DialogDescription>
            Membro desde:  <span className="text-xs text-foreground/50">{new Date(data.createdAt).toLocaleTimeString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</span>
          </DialogDescription>
        </div>

        <DialogFooter className="flex flex-col gap-2 lg:gap-0">
          <DialogClose asChild>
            <Button variant="outline">Ok</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}