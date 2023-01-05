import { Fragment, useState } from "react";
import {
  Button,
  Dialog,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  TextField,
} from "@mui/material";
import axios from "axios";
import { vttToPlainText } from "vtt-to-text";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";

function App() {
  const [url, setURL] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [open, setOpen] = useState(false);
  const clear = () => {
    setURL("");
    setSubtitle("");
  };
  const copy = async () => {
    await navigator.clipboard.writeText(subtitle);
  };
  const change = (e) => {
    setURL(e.target.value);
  };

  const close = () => {
    clear();
    setOpen(false);
  };

  const submit = async () => {
    const urlParams = new URLSearchParams(url);
    const lang = urlParams.get("wtlocale");
    const lank = urlParams.get("lank");
    const itemInfoUrl = `https://b.jw-cdn.org/apis/mediator/v1/media-items/${lang}/${lank}`;
    try {
      const payload = await axios.get(itemInfoUrl);
      const subtitleURL = payload.data.media[0].files[0].subtitles.url;
      axios.get(subtitleURL).then((res) => {
        const sub = vttToPlainText(res.data);
        setSubtitle(sub.replaceAll(" ", "\n"));
      });
    } catch {
      setOpen(true);
    }
  };
  return (
    <Fragment>
      <Fab color='primary' className='fixed right-3 bottom-3' onClick={copy}>
        <ContentCopyIcon />
      </Fab>
      <Fab color='warning' className='fixed right-3 bottom-20' onClick={clear}>
        <DeleteIcon />
      </Fab>
      <Dialog open={open} onClose={close}>
        <DialogTitle>錯誤</DialogTitle>
        <DialogContent>
          <DialogContentText>您張貼的網址錯誤，或是該影片不提供字幕</DialogContentText>
        </DialogContent>
      </Dialog>
      <div className='flex flex-col p-5'>
        <div className='flex space-x-2'>
          <TextField className='flex-auto' label='Video URL' value={url} onChange={change} />
          <Button variant='contained' onClick={submit}>
            送出
          </Button>
        </div>
        <TextField
          label='Subtitle'
          className='h-screen overflow-auto mt-7'
          value={subtitle}
          minRows={10}
          multiline
          InputProps={{
            readOnly: true,
          }}
        />
      </div>
    </Fragment>
  );
}

export default App;
