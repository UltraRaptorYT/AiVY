import { useEffect } from "react";
import WalletBalance from "@/components/WalletBalance";

function Home() {
  useEffect(() => {
    console.log(window.ethereum);
  }, [window]);
  return (
    <div>
      <WalletBalance />
    </div>
  );
}

export default Home;
