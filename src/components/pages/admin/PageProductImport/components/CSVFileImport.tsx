import React from "react";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios, { AxiosError } from "axios";

type CSVFileImportProps = {
  url: string;
  title: string;
};

export default function CSVFileImport({ url, title }: CSVFileImportProps) {
  const [file, setFile] = React.useState<File>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      const file = files[0];
      setFile(file);
    }
  };

  const removeFile = () => {
    setFile(undefined);
  };

  const uploadFile = async () => {
    console.log("uploadFile to", url);
    if (file) {
      const {
        data: { url: signedUrl },
      } = await axios({
        method: "GET",
        url,
        headers: {
          Authorization: `Basic ${localStorage.getItem("authorization_token")}`,
        },
        params: {
          filename: encodeURIComponent(file.name),
        },
      });

      try {
        await fetch(signedUrl, {
          method: "PUT",
          body: file,
        });
      } catch (e) {
        if ((e as AxiosError)?.response?.status === 401) {
          alert("Unauthorized, please log in");
        } else if ((e as AxiosError)?.response?.status === 403) {
          alert("Forbidden, you don't have access to this!");
        }
      }

      setFile(undefined);
    }
  };
  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      {!file ? (
        <input type="file" onChange={onFileChange} />
      ) : (
        <div>
          <button onClick={removeFile}>Remove file</button>
          <button onClick={uploadFile}>Upload file</button>
        </div>
      )}
    </Box>
  );
}
