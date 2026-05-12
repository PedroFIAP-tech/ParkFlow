"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Camera, FileImage, UploadCloud, X } from "lucide-react";
import { useState } from "react";

export function UploadDropzone() {
  const [files, setFiles] = useState<string[]>(["frontal-dano.jpg", "lateral-direita.jpg"]);

  function addFakeFile() {
    setFiles((current) => [...current, `vistoria-${current.length + 1}.jpg`]);
  }

  function removeFile(file: string) {
    setFiles((current) => current.filter((item) => item !== file));
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={addFakeFile}
        className="group flex min-h-40 w-full flex-col items-center justify-center rounded-xl border border-dashed border-electric/35 bg-brand/10 p-5 text-center transition hover:bg-brand/15"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-electric/30 bg-electric/10 transition group-hover:scale-105">
          <UploadCloud className="h-6 w-6 text-electric" />
        </div>
        <p className="mt-4 text-sm font-semibold text-white">Adicionar fotos da ocorrencia</p>
        <p className="mt-1 text-xs leading-5 text-slate-400">Clique para simular upload. Depois conectamos ao Cloudinary.</p>
      </button>

      <AnimatePresence initial={false}>
        {files.map((file) => (
          <motion.div
            key={file}
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 12, scale: 0.98 }}
            className="flex items-center justify-between gap-3 rounded-lg border border-line bg-black/20 p-3"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-white/5">
                {file.endsWith(".jpg") ? <Camera className="h-4 w-4 text-electric" /> : <FileImage className="h-4 w-4 text-electric" />}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{file}</p>
                <p className="text-xs text-slate-500">Pronto para analise visual</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => removeFile(file)}
              className="flex h-8 w-8 items-center justify-center rounded-md text-slate-500 transition hover:bg-danger/10 hover:text-danger"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

