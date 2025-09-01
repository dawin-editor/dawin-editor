import Content from "./components/Editor/Content";
import NavBar from "./components/Editor/NavBar";
const Layout = () => {
  return (
    <div className=" bg-amber-800 flex flex-col min-h-screen">
      <NavBar />
      <Content/>
    </div>
  );
};

export default Layout;
