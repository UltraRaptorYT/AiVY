import { Button } from "@/components/ui/button";
import Nav from "@/components/Nav";
import { useEffect, useState } from "react";

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

function Home() {
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS || "";
  const [provider, setProvider] = useState<ethers.providers.Web3Provider>();
  const [accountID, setAccountID] = useState<string>();
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [name, setName] = useState<string>();
  const [description, setDescription] = useState<string>();
  const [poisonState, setPoisonState] = useState<boolean>(true);

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
    }
  }, [provider]);
  useEffect(() => {
    console.log(accountID, contractAddress);
  }, [accountID]);

  const handleFilesAccepted = (files: File[]) => {
    setUploadedFiles(files);
    // Add any additional processing logic here
    console.log("Accepted files:", files);
  };

  function submitForm() {
    if (uploadedFiles.length == 0) {
      toast.error("No Artwork Uploaded");
    }
    if (name?.trim().length == 0) {
      toast.error("Missing Name for Artwork");
    }
    console.log(name, description, poisonState);
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
                  value={name}
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
                  value={description}
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
                MINT Now
              </Button>
            </div>
            <FileUpload
              className="grow  order-0 sm:order-1"
              onFilesAccepted={handleFilesAccepted}
            />
          </div>
          <div className="flex flex-col grow">
            <h3 className="text-lg font-bold">Your Master Pieces</h3>
            <div>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Amet
              sapiente vitae ratione modi cupiditate doloremque fugit aliquid
              ullam ex blanditiis, accusamus excepturi pariatur quos culpa
              tenetur incidunt ea sed sunt.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
