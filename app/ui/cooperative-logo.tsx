import { GlobeAltIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';

// Added { isDashboard } prop to control size
export default function CooperativeLogo({ isDashboard = false }: { isDashboard?: boolean }) {
  return (
    <div className={`${lusitana.className} flex flex-row items-center leading-none`}>
      <GlobeAltIcon 
        className={`${
          isDashboard ? 'h-8 w-8' : 'h-12 w-12' 
        } rotate-[15deg] text-green-700 shrink-0`} 
      />
      
      <p className={`ml-2 font-bold text-green-700 ${
        isDashboard ? 'text-xl' : 'text-[44px]'
      }`}>
        SULEJA HHMCSOC
      </p>
    </div>
  );
}