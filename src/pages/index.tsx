import { NextPageWithLayout } from "../types";
import { DashboardLayout } from "../layouts";

const Home: NextPageWithLayout = () => {
  return <h1>Home page</h1>;
};

Home.getLayout = function getLayout(page: React.ReactElement) {
  return <DashboardLayout title="Home">{page}</DashboardLayout>;
};

export default Home;
