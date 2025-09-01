import Content from "./Content";
import NavBar from "./NavBar";
const Layout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <NavBar />
      <Content/>
    </div>
  );
};

export default Layout;
