import { redirect } from 'next/navigation'

export default function ResolutionsRedirect() {
  redirect('/portal?tab=resolutions')
}
