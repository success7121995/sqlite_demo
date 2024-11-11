

import { LinkButton } from '@/src/components';

const Home = () => { 
  return (<>
    <div className="flex justify-center items-center h-screen">
      <LinkButton href="/stores" color="primary" className="text-white">View Database</LinkButton>
    </div>
  </>)
};

export default Home;