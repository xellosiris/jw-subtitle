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
  const onSubtitleChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSubtitle(event.target.value);
  };

  const submit = async () => {
    try {
      const urlParams = new URL(url).searchParams;
      const lang = urlParams.get("wtlocale");
      const docid = urlParams.get("docid");
      const lank = urlParams.get("lank");
      if (!lang || (!docid && !lank)) {
        throw new Error("invalid query params");
      }

      const requestCandidates: Array<() => Promise<{ subtitleURL: string; videoTitle?: string }>> = [];

      if (docid) {
        requestCandidates.push(async () => {
          const pubMediaUrl = `https://b.jw-cdn.org/apis/pub-media/GETPUBMEDIALINKS?docid=${encodeURIComponent(docid)}&output=json&fileformat=m4v%2Cmp4%2C3gp%2Cmp3&alllangs=1&track=1&langwritten=${encodeURIComponent(lang)}&txtCMSLang=${encodeURIComponent(lang)}`;
          const payload = await axios.get(pubMediaUrl);
          const filesByLanguage = payload.data?.files?.[lang];
          const mediaItem = filesByLanguage.MP4[0];
          const subtitleURL = mediaItem?.subtitles?.url;

          if (!subtitleURL) {
            throw new Error("pub-media no subtitle");
          }

          return {
            subtitleURL,
            videoTitle: mediaItem?.title,
          };
        });
      }

      if (lank) {
        requestCandidates.push(async () => {
          const itemInfoUrl = `https://b.jw-cdn.org/apis/mediator/v1/media-items/${encodeURIComponent(lang)}/${encodeURIComponent(lank)}`;
          const payload = await axios.get(itemInfoUrl);
          const subtitleURL = payload.data?.media?.[0]?.files?.[0]?.subtitles?.url;
          if (!subtitleURL) {
            throw new Error("mediator no subtitle");
          }

          return {
            subtitleURL,
            videoTitle: payload.data?.media?.[0]?.title,
          };
        });
      }

      let subtitleURL = "";
      let videoTitle: string | undefined;
      let lastError: unknown;

      for (const requestCandidate of requestCandidates) {
        try {
          const result = await requestCandidate();
          subtitleURL = result.subtitleURL;
          videoTitle = result.videoTitle;
          break;
        } catch (error) {
          lastError = error;
        }
      }

      if (!subtitleURL) {
        throw lastError ?? new Error("all api failed");
      }

      const res = await axios.get(subtitleURL);
      const subtitles = parser.parse(res.data, "subtitles");
      const subs = subtitles.cues.map((s) => s.text);
      setSubtitle(subs.join("\n"));
      setTitle(videoTitle);
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
        <Input className="w-full" placeholder="請把影片連結貼在這裡" value={url} onChange={change} />
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
        <Textarea value={subtitle} onChange={onSubtitleChange} className="h-full text-foreground" />
      </div>
      <a href="mailto:xellosiris@gmail.com" className="flex items-center space-x-3 text-sm text-muted-foreground">
        <Send size={16} />
        <span>xellosiris@gmail.com</span>
      </a>
    </div>
  );
}
