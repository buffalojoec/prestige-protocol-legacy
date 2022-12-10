import { PrestigeDao } from 'components/PrestigeDao';
import { FC } from 'react';


export const HomeView: FC = ({ }) => {

  return (

    <div className="md:hero mx-auto p-4">
      <div className="md:hero-content flex flex-col">        
          <div className="text-center">
          <PrestigeDao/>
        </div>
      </div>
    </div>
  );
};
