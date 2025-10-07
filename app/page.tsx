import OutreachSystem from './components/OutreachSystem';
import SimpleAuth from './components/SimpleAuth';

export default function Home() {
  return (
    <SimpleAuth>
      <OutreachSystem />
    </SimpleAuth>
  );
}
