/**
 * v0 by Vercel.
 * @see https://v0.dev/t/ojrur0X7y4x
 * Documentation: https://v0.dev/docs#integrating-generated-code-into-your-nextjs-app
 */

type EmptyIndicatorProps = {
  title?: string
  content?: string
}
export function EmptyIndicator({
  title = 'Nada para mostrar',
  content = 'Parece que não há nada por aqui...'
}: EmptyIndicatorProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-2">
      <div className="flex items-center justify-center w-8 h-8 bg-foreground/10 rounded-full ">
        <InboxIcon className="w-4 h-4 text-foreground" />
      </div>
      <div className="space-y-1 text-center">
        <h2 className="text-2xs font-bold tracking-tight">{title}</h2>
        <p className="text-xs text-gray-500 truncate">
          {content}
        </p>
      </div>
    </div>
  )
}

function InboxIcon(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  )
}