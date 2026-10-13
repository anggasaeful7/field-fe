import { Link } from 'react-router';
import logodark from '@/assets/images/logos/logoicon-dark.svg';

const FullLogo = () => {
  return (
    <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
      <img
        src={logodark}
        alt="Logo"
        width={32}
        height={32}
        className="w-8 h-8 shrink-0 dark:invert"
      />
      <span className="font-semibold text-sm tracking-tight text-foreground group-data-[state=collapsed]:hidden">
        Field Report
      </span>
    </Link>
  );
};

export default FullLogo;
