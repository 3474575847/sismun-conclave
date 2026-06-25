import { redirect } from 'next/navigation'

export default function AmendmentsRedirect() {
  redirect('/portal?tab=amendments')
}
