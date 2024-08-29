import FuturisticButton from "./FuturisticButton";
import { Send } from 'lucide-react';

export const SendButton = (props:any) => (
    <FuturisticButton {...props}>
      <Send size={18} />
    </FuturisticButton>
  );