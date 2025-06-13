import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Member } from "@/http/fetch-channel-members";
import { authSlice } from "@/store/auth";
import { Crown } from "lucide-react";

type MemberItemProps = {
  data: Member;
};


export function MemberItem({ data }: MemberItemProps) {
  const { auth } = authSlice(state => state)

  return (
    <Dialog>
      <DialogTrigger asChild>
        <div className={`flex items-center space-x-2 text-sm}`}>
          <div className='flex flex-1 items-center space-x-2'>
            <img
              src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.usuario_nome}`}
              alt={data.usuario_nome}
              className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
            />
            <span className={`truncate capitalize ${auth.user.id === data.usuario_id ? 'text-green-500 animate-pulse' : ''}`}>{data.usuario_nome}</span>
          </div>
          {data.usuario_adm === 'SIM' && (
            <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Detalhes do membro</DialogTitle>
        </DialogHeader>
        <div className="mt-4 w-full flex flex-col justify-center items-center space-y-2">
          {data.usuario_adm === 'SIM' && (
            <Crown className="w-4 h-4 text-yellow-500 animate-pulse" />
          )}
          <Avatar>
            <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${data.usuario_nome}`} alt={data.usuario_nome} />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <DialogDescription>
            {data.usuario_nome}
          </DialogDescription>
          <DialogDescription>
            Membro desde:  <span className="text-xs text-foreground/50">{new Date(data.criado_em).toLocaleTimeString([], { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'UTC' })}</span>
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