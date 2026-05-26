import { loginAction } from './actions';

interface Props {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: Props) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm space-y-6 bg-white p-8 shadow-sm border border-gray-200 rounded-lg">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">akra Admin</h1>
          <p className="text-sm text-gray-500">Sign in to manage your inventory.</p>
        </div>

        <form action={loginAction} className="space-y-4">
          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
              placeholder="Enter admin password"
            />
          </div>

          {error && (
            <p className="text-sm text-red-600">Invalid password. Please try again.</p>
          )}

          <button
            type="submit"
            className="w-full rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}
