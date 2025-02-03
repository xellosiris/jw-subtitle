import axios from "axios";
import { Send } from "lucide-react";
import { useState } from "react";
import { WebVTTParser } from "webvtt-parser";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Textarea } from "./components/ui/textarea";
import { useToast } from "./hooks/use-toast";

const parser = new WebVTTParser();

export function Subtitle() {
  const [url, setURL] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [title, setTitle] = useState<string | undefined>(undefined);
  const { toast } = useToast();
  const change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setURL(event.target.value);
  };

  const submit = async () => {
    try {
      const urlParams = new URL(url).searchParams;
      const lang = urlParams.get("wtlocale");
      const lank = urlParams.get("lank");
      const itemInfoUrl = `https://b.jw-cdn.org/apis/mediator/v1/media-items/${lang}/${lank}`;
      const payload = await axios.get(itemInfoUrl);
      const subtitleURL = payload.data.media[0].files[0].subtitles.url;
      const res = await axios.get(subtitleURL);
      const subtitles = parser.parse(res.data, "subtitles");
      const subs = subtitles.cues.map((s) => s.text);
      setSubtitle(subs.join("\n"));
      setTitle(payload.data.media[0].title);
    } catch (e) {
      toast({
        title: "錯誤",
        description: "請檢查網址是否正確",
        variant: "destructive",
      });
    }
  };
  return (
    <div className="flex flex-col h-screen max-w-2xl p-3 mx-auto space-y-3">
      <h1 className="text-2xl">JW Subtitle Extract</h1>
      <div>
        <Label>使用方式</Label>
        <div className="text-sm text-muted-foreground">
          請從JW Library複製影片的分享連結並張貼在下方欄位，
          <span className="text-destructive">請不要從瀏覽器複製網址</span>
        </div>
      </div>
      <div className="flex gap-2">
        <Input
          className="w-full"
          placeholder="請把影片連結貼在這裡"
          value={url}
          onChange={change}
        />
        <Button onClick={submit}>送出</Button>
        <Button
          variant={"destructive"}
          onClick={() => {
            setSubtitle("");
            setURL("");
            setTitle(undefined);
          }}
        >
          清除
        </Button>
      </div>
      <Label>影片名稱：{title ? title : "未輸入..."}</Label>
      <div className="h-full flex flex-col gap-1.5">
        <Label>字幕內容</Label>
        <Textarea value={subtitle} className="h-full text-foreground" />
      </div>
      <a
        href="mailto:xellosiris@gmail.com"
        className="flex items-center space-x-3 text-sm text-muted-foreground"
      >
        <Send size={16} />
        <span>xellosiris@gmail.com</span>
      </a>
    </div>
  );
}
