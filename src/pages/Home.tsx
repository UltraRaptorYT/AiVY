import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import React, { ReactNode, useEffect, useState } from "react";

import { ethers } from "ethers";
import FileUpload from "@/components/FileUpload";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Info } from "lucide-react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import FiredGuys from "../artifacts/contracts/MyNFT.sol/FiredGuys.json";

function Home() {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [accountID, setAccountID] = useState<string>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [poisonState, setPoisonState] = useState<boolean>(true);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [cid, setCid]: any = useState();
  const [signer, setSigner] = useState<ethers.providers.JsonRpcSigner>();
  const [contract, setContract] = useState<ethers.Contract>();
  const [open, setOpen] = useState<boolean>(false);

  useEffect(() => {
    console.log(window.ethereum);
    if (window.ethereum) {
      setProvider(new ethers.providers.Web3Provider(window.ethereum));
    } else {
      console.log("No Metamask");
    }
  }, [window]);

  useEffect(() => {
    async function getAccountID() {
      let accounts = await provider?.listAccounts();
      if (accounts && accounts[0]) {
        setAccountID(accounts[0]);
      }
    }
    if (provider) {
      getAccountID();
      setSigner(provider.getSigner());
    }
  }, [provider]);

  useEffect(() => {
    console.log(accountID, contractAddress);
  }, [accountID]);

  useEffect(() => {
    setContract(new ethers.Contract(contractAddress, FiredGuys.abi, signer));
  }, [contractAddress, FiredGuys, signer]);

  const handleFilesAccepted = (files: File[]) => {
    setUploadedFiles(files);
    // Add any additional processing logic here
    console.log("Accepted files:", files);
  };

  async function submitForm() {
    if (isMinting) {
      return;
    }
    setIsMinting(true);
    try {
      if (uploadedFiles.length == 0) {
        throw new Error("No Artwork Uploaded");
      }
      if (!name || name?.trim().length == 0) {
        throw new Error("Missing Name for Artwork");
      }
      console.log(name, description, poisonState);

      const metadata = {
        name: name,
        description: description,
        accountID: accountID,
      };

      // Steganography
      const steganoFormData = new FormData();
      steganoFormData.append("image", uploadedFiles[0]);
      steganoFormData.append("message", JSON.stringify(metadata));
      const steganoRes = await fetch(
        `${import.meta.env.VITE_SERVER_URL}/encode/stegano`,
        {
          method: "POST",
          body: steganoFormData,
        }
      );
      const steganoResData = await steganoRes.blob();
      console.log(steganoResData, steganoResData.type, uploadedFiles[0].name);
      let convertedFile = new File([steganoResData], uploadedFiles[0].name, {
        type: steganoResData.type,
      });

      // Poison Model
      if (poisonState) {
        // need await for image
        const formData = new FormData();
        formData.append("image", convertedFile);
        const poisonRes = await fetch(
          `${import.meta.env.VITE_SERVER_URL}/poison`,
          {
            method: "POST",
            body: formData,
          }
        );
        const poisonResData = await poisonRes.blob();
        convertedFile = new File([poisonResData], uploadedFiles[0].name, {
          type: poisonResData.type,
        });
      }

      // MINTING NFT
      if (!(contract && signer)) {
        setIsMinting(false);
        return;
      }
      const connection = contract.connect(signer);
      const addr = connection.address;
      const result = await contract.payToMint(addr, JSON.stringify(metadata), {
        value: ethers.utils.parseEther("0.001"),
      });

      await result.wait();
      console.log(result);
      // const mintResult = await contract.isContentOwned(metadata);
      // console.log(mintResult);

      // Upload IPFS
      const formData = new FormData();
      formData.append("file", convertedFile);

      formData.append(
        "pinataMetadata",
        JSON.stringify({ name: name, keyvalues: metadata })
      );

      const options = JSON.stringify({
        cidVersion: 0,
      });
      formData.append("pinataOptions", options);
      const res = await fetch(
        "https://api.pinata.cloud/pinning/pinFileToIPFS",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_PINATA_JWT}`,
          },
          body: formData,
        }
      );
      const resData = await res.json();
      setCid(resData.IpfsHash);
      setOpen(true);
      console.log(resData);
      setIsMinting(false);
    } catch (error) {
      setIsMinting(false);
      toast.error(
        JSON.stringify({
          message: (error as Error).message,
        })
      );
      console.error(error);
    }
  }
  async function downloadImage(imgURL: string) {
    const link = document.createElement("a");
    link.setAttribute("target", "_blank");
    link.download = imgURL.substring(
      imgURL.lastIndexOf("/") + 1,
      imgURL.length
    );
    let data = await fetch(imgURL);
    let blob = await data.blob();
    link.href = URL.createObjectURL(blob);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  return (
    <div className="flex flex-col h-full">
      <Nav />
      <div className="h-full grid gap-2 p-6 grow">
        <div className="w-full max-w-4xl mx-auto flex flex-col gap-12 h-full">
          <div className="flex w-full min-h-[350px] gap-8 h-full flex-col sm:flex-row">
            <div className="flex gap-5 flex-col w-full  order-1 sm:order-0 sm:w-[250px]">
              <h1 className="title text-xl font-bold text-center underline ">
                AiVY
              </h1>
              <span>
                <em>Mint your images </em>
              </span>
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="Name">Name</Label>
                <Input
                  type="text"
                  id="Name"
                  placeholder="Name"
                  value={name || ""}
                  onInput={(e) => {
                    setName((e.target as HTMLInputElement).value);
                  }}
                />
              </div>
              <div className="grid w-full gap-1.5">
                <Label htmlFor="description">Description [Optional]</Label>
                <Textarea
                  placeholder="Type your description here."
                  id="description"
                  className="max-h-[200px]"
                  value={description || ""}
                  onInput={(e) => {
                    setDescription((e.target as HTMLTextAreaElement).value);
                  }}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="poison"
                  checked={poisonState}
                  onCheckedChange={() => setPoisonState((prev) => !prev)}
                />
                <Label htmlFor="poison" className="flex items-center gap-2">
                  Poison Image
                  <HoverCard>
                    <HoverCardTrigger>
                      <Info size={18} />
                    </HoverCardTrigger>
                    <HoverCardContent>
                      We will be applying a small filter to your art work which
                      will protect your art from AI. Note that there might be
                      slight difference in final artwork.
                    </HoverCardContent>
                  </HoverCard>
                </Label>
              </div>
              <Button className="w-fit mx-auto" onClick={() => submitForm()}>
                {isMinting ? "Minting..." : "MINT Now"}
              </Button>
            </div>
            <FileUpload
              className="grow  order-0 sm:order-1"
              onFilesAccepted={handleFilesAccepted}
            />
          </div>
          {/* <div className="flex flex-col grow">
            <h3 className="text-lg font-bold">Your Master Pieces</h3>
            <div>
              {cid && (
                <img
                  src={`${import.meta.env.VITE_GATEWAY_URL}/ipfs/${cid}`}
                  alt="ipfs image"
                />
              )}
            </div>
          </div> */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle className="dark:text-white">
                  Your Art has been successfully MINTED!
                </DialogTitle>
                <DialogDescription className="flex flex-col justify-center gap-3 items-center">
                  {cid && (
                    <img
                      src={`${import.meta.env.VITE_GATEWAY_URL}/ipfs/${cid}`}
                      alt="ipfs image"
                      className="h-[400px] w-auto"
                    />
                  )}
                  <Button
                    className="mx-auto"
                    onClick={() =>
                      downloadImage(
                        `${import.meta.env.VITE_GATEWAY_URL}/ipfs/${cid}`
                      )
                    }
                  >
                    Download Image
                  </Button>
                </DialogDescription>
              </DialogHeader>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
}

export default Home;
