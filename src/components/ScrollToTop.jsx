import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Mounted once, near the top of the router tree. React Router's <Link>
// navigations don't reset scroll position by default, so without this,
// clicking a link while scrolled down (e.g. a footer link) leaves the
// user on the new page still scrolled to wherever they were before.
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return null;
};

export default ScrollToTop;