interface UserInfoProps {
  fullName: string
  email: string
  onLogout: () => void
}

export default function UserInfo({ fullName, email, onLogout }: UserInfoProps) {
  return (
    <div className="bg-white rounded-xl border border-neutral-200 shadow-soft-sm p-3 sm:p-4">
      <h2 className="text-sm sm:text-base font-bold text-neutral-800 mb-3">User Information</h2>
      <div className="space-y-2">
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-0.5">Full Name</label>
          <p className="text-sm text-neutral-800">{fullName}</p>
        </div>
        <div>
          <label className="block text-xs font-medium text-neutral-500 mb-0.5">Email</label>
          <p className="text-sm text-neutral-800">{email}</p>
        </div>
      </div>
      <button
        onClick={onLogout}
        className="mt-3 w-full py-1.5 px-3 text-xs font-medium text-error-600 bg-error-50 border border-error-200 rounded-lg hover:bg-error-100 transition-colors"
      >
        Log Out
      </button>
    </div>
  )
}
