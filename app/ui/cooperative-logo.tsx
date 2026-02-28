import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

export default function CooperativeLogo() {
  return (
    <div
      className={`${lusitana.className} flex flex-row items-center leading-none`}
    >
      {/* Force the icon to have its own visible color */}
      <GlobeAltIcon className="h-12 w-12 rotate-[15deg] text-green shrink-0" />
      <p className="ml-2 text-[44px] text-green-700">SULEJA HHMCSOC</p>
    </div>
  );
}
