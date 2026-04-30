import { useSiteContent } from "@/hooks/useSiteContent";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const { data: content } = useSiteContent("footer");
  const name = content?.name ?? "Rafsan";
  const navigate = useNavigate();

  return (
    <footer className="py-8 border-t border-border">
      <div className="container mx-auto px-6 text-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} <span 
            className="text-gradient font-semibold cursor-default select-none" 
            onClick={() => navigate("/admin/login")}
          >
            {name}
          </span>. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
