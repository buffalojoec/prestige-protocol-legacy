import type { NextPage } from "next";
import Head from "next/head";
import { HomeView } from "../views";

const Home: NextPage = (props) => {
  return (
    <div>
      <Head>
        <title>Prestige DAO</title>
        <meta
          name="description"
          content="Prestige DAO"
        />
      </Head>
      <HomeView />
    </div>
  );
};

export default Home;
