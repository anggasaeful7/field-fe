import AuthLogin from '../../authforms/auth-login';

const BoxedLogin = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4 py-8">
      <div className="w-full max-w-md bg-card rounded-2xl border shadow-sm p-6 sm:p-8">
        <AuthLogin />
      </div>
    </div>
  );
};

export default BoxedLogin;
