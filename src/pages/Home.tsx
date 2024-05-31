import WalletBalance from "../components/WalletBalance";
import { useEffect, useState } from "react";

import { ethers } from "ethers";
import FiredGuys from "../artifacts/contracts/MyNFT.sol/FiredGuys.json";
import { Button } from "@/components/ui/button";
import FileUpload from "../components/FileUpload";

const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";

const provider = new ethers.providers.Web3Provider(window.ethereum);

// get the end user
const signer = provider.getSigner();

// get the smart contract
const contract = new ethers.Contract(contractAddress, FiredGuys.abi, signer);

function Home() {
  const [totalMinted, setTotalMinted] = useState(0);
  useEffect(() => {
    getCount();
  }, []);

  const getCount = async () => {
    const count = await contract.count();
    console.log(parseInt(count));
    setTotalMinted(parseInt(count));
  };

  return (
    <div>
      <WalletBalance />

      <h1>Fired Guys NFT Collection</h1>
      <div className="container w-full">
        <div className="flex flex-wrap gap-5">
          {Array(totalMinted + 1)
            .fill(0)
            .map((_, i) => (
              <div key={i} className="w-fit">
                <NFTImage tokenId={i} getCount={getCount} />
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}

function NFTImage({
  tokenId,
  getCount,
}: {
  tokenId: number;
  getCount: () => void;
}) {
  const contentId = "QmSXHfJ9Sy5uRC1yGUdZGmYwpAcpmSbVVQ6K2uB36UfTD1";
  const metadataURI = `${contentId}/${tokenId}.json`;
  const imageURI = `https://green-able-crawdad-160.mypinata.cloud/ipfs/${contentId}/${tokenId}.png`;
  //   const imageURI = `img/${tokenId}.png`;

  const [isMinted, setIsMinted] = useState(false);
  useEffect(() => {
    getMintedStatus();
  }, [isMinted]);

  const getMintedStatus = async () => {
    const result = await contract.isContentOwned(metadataURI);
    console.log(result);
    setIsMinted(result);
  };

  const mintToken = async () => {
    const connection = contract.connect(signer);
    const addr = connection.address;
    const result = await contract.payToMint(addr, metadataURI, {
      value: ethers.utils.parseEther("0.001"),
    });

    await result.wait();
    getMintedStatus();
    getCount();
  };

  async function getURI() {
    const uri = await contract.tokenURI(tokenId);
    alert(uri);
  }
  return (
    <div className="card" style={{ width: "18rem" }}>
      <img
        className="card-img-top"
        src={isMinted ? imageURI : "img/placeholder.png"}
      ></img>
      <div className="card-body">
        <h5 className="card-title">ID #{tokenId}</h5>
        {!isMinted ? (
          <Button onClick={mintToken}>Mint</Button>
        ) : (
          <Button onClick={getURI}>Taken! Show URI</Button>
        )}
      </div>
      <FileUpload />
    </div>
  );
}

export default Home;
