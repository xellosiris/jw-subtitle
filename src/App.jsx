import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import DeleteIcon from "@mui/icons-material/Delete";
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
import { parse } from "node-webvtt";
import { Fragment, useState } from "react";

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
        const subtitles = parse(res.data);
        const subs = subtitles.cues.map((s) => s.text);
        setSubtitle(subs.join("\n"));
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
          <DialogContentText>
            The link you pasted is wrong or subtitle is not existed
          </DialogContentText>
        </DialogContent>
      </Dialog>
      <div className='flex flex-col h-screen p-5'>
        <h1 className='text-3xl my-3'>JW Subtitle Extract</h1>
        <div className='my-3'>
          <p className='font-semibold'>Instruction</p>
          <p>
            Please copy the share link of video ,{" "}
            <span className='text-red-600'>DO NOT COPY URL FROM BROWSER</span> , from JW Library or
            JW.org then paste it below.
          </p>
        </div>
        <div className='flex space-x-2'>
          <TextField
            className='flex-auto'
            label='Video Share Link'
            placeholder='paste your share link here'
            value={url}
            onChange={change}
          />
          <Button variant='contained' onClick={submit}>
            送出
          </Button>
        </div>
        <TextField
          label='Subtitle'
          classes={{ root: "h-full mt-7" }}
          value={subtitle}
          multiline
          InputProps={{
            readOnly: true,
            classes: { root: "h-full", input: "h-full overflow-y-auto" },
            // style: {
            //   height: "100%",
            //   overflow: "auto",
            // },
          }}
        />
        <p className='text-gray-500'>contact:xellosiris@gmail.com</p>
      </div>
    </Fragment>
  );
}

export default App;
