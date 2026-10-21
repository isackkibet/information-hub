"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FormField, FormTextarea, FormSelect } from "@/components/forms/form-field";
import { Card, CardContent } from "@/components/ui/card";
import { contentApi, fileUploadService, reportService } from "@/frontend/services";
import type { Category } from "@/types";
import { useToast } from "@/components/ui/toast";
import { CheckCircle, FileText, ImagePlus, Loader2, Upload, X } from "lucide-react";

interface FormState {
  title: string;
  description: string;
  category: string;
  location: string;
}

const EMPTY: FormState = { title: "", description: "", category: "", location: "" };

export default function SubmitReportPage() {
  const { toast } = useToast();
  const [form, setForm] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [categoryOptions, setCategoryOptions] = useState<Category[]>([]);
  const [categoryLoadError, setCategoryLoadError] = useState("");
  const [attachment, setAttachment] = useState<File | null>(null);
  const [attachmentError, setAttachmentError] = useState("");
  const [attachmentPreview, setAttachmentPreview] = useState("");
  const [attachmentInputKey, setAttachmentInputKey] = useState(0);
  const [reportId, setReportId] = useState("");

  useEffect(() => {
    let active = true;
    contentApi.getCategories().then((result) => {
      if (active) setCategoryOptions(result);
    }).catch(() => {
      if (active) setCategoryLoadError("Categories could not be loaded. Refresh the page and try again.");
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!attachment || !attachment.type.startsWith("image/")) {
      setAttachmentPreview("");
      return;
    }
    const previewUrl = URL.createObjectURL(attachment);
    setAttachmentPreview(previewUrl);
    return () => URL.revokeObjectURL(previewUrl);
  }, [attachment]);

  const chooseAttachment = (file?: File) => {
    setAttachmentError("");
    if (!file) {
      setAttachment(null);
      return;
    }
    const allowedTypes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setAttachmentError("Choose a PDF, JPG, PNG, or WEBP file.");
      setAttachment(null);
      setAttachmentInputKey((key) => key + 1);
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      setAttachmentError("This file is larger than 8 MB. Choose a smaller file.");
      setAttachment(null);
      setAttachmentInputKey((key) => key + 1);
      return;
    }
    setAttachment(file);
  };

  const validate = (): boolean => {
    const e: Partial<Record<keyof FormState, string>> = {};
    if (!form.title.trim()) e.title = "Title is required";
    else if (form.title.length < 5) e.title = "Title must be at least 5 characters";
    if (!form.description.trim()) e.description = "Description is required";
    else if (form.description.length < 20) e.description = "Description must be at least 20 characters";
    if (!form.category) e.category = "Please select a category";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast("Please fix the errors before submitting", "error");
      return;
    }
    setSubmitting(true);
    let uploadedId: string | undefined;
    try {
      let attachmentId: string | undefined;
      if (attachment) {
        const upload = await fileUploadService.upload(attachment);
        if (!upload.ok || !upload.id) throw new Error(upload.reason || "The attachment could not be uploaded.");
        attachmentId = upload.id;
        uploadedId = upload.id;
      }
      const result = await reportService.submit({
        title: form.title.trim(),
        description: form.description.trim(),
        categoryId: form.category,
        location: form.location.trim() || undefined,
        attachmentId,
      });
      setReportId(result.report.id);
      setSent(true);
      toast("Your report was submitted", "success");
    } catch (error) {
      if (uploadedId) await fileUploadService.remove(uploadedId).catch(() => undefined);
      toast(error instanceof Error ? error.message : "Unable to submit your report", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-xl">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-emerald-100 p-3 dark:bg-emerald-950">
                <CheckCircle className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-xl font-semibold">Report submitted</h1>
                <p className="text-sm text-muted-foreground">Your report has been saved for review.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 rounded-lg bg-muted p-4 text-sm">
              <p><span className="font-medium">Title:</span> {form.title}</p>
              <p><span className="font-medium">Category:</span> {categoryOptions.find(c => c.id === form.category)?.name}</p>
              <p><span className="font-medium">Location:</span> {form.location || "Not specified"}</p>
              {reportId && <p><span className="font-medium">Reference:</span> {reportId}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => { setForm(EMPTY); setAttachment(null); setAttachmentInputKey((key) => key + 1); setReportId(""); setSent(false); }}>Submit another report</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl">
        <h1 className="text-2xl font-semibold">Submit a Community Report</h1>
        <p className="text-muted-foreground">
          Share concerns related to the Lake Victoria Basin — environment, livelihoods, rights, or community
          development.
        </p>

        <Card className="mt-6">
          <CardContent className="p-6">
            <form onSubmit={submit} className="space-y-4" noValidate>
              <FormField
                label="Report title"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                error={errors.title}
                placeholder="Brief title of the issue"
                required
              />
              <FormTextarea
                label="Description"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                error={errors.description}
                placeholder="Describe what you observed, when and where it happened"
                rows={5}
                required
              />
              <FormSelect
                label="Category"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                error={errors.category}
                required
              >
                <option value="">Select a category</option>
                {categoryOptions.filter((c) => c.enabled).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </FormSelect>
              {categoryLoadError && <p role="alert" className="text-sm text-destructive">{categoryLoadError}</p>}
              <FormField
                label="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="County or area (optional)"
                hint="Helps reviewers identify the area affected"
              />
              <div className="space-y-2">
                <div>
                  <p className="text-sm font-medium">Add a photo or document <span className="font-normal text-muted-foreground">(optional)</span></p>
                  <p className="mt-1 text-xs text-muted-foreground">A clear photo can help reviewers understand your report.</p>
                </div>
                <input
                  id="report-attachment"
                  key={attachmentInputKey}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp"
                  className="sr-only"
                  onChange={(event) => chooseAttachment(event.target.files?.[0])}
                />
                <label htmlFor="report-attachment" className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed border-primary/40 bg-primary/[0.03] px-4 py-5 text-sm font-medium transition hover:bg-primary/[0.08] focus-within:ring-2 focus-within:ring-ring">
                  <ImagePlus className="h-5 w-5 text-primary" />
                  {attachment ? "Choose a different file" : "Choose a photo or document"}
                  <span className="font-normal text-muted-foreground">from this device</span>
                </label>
                <p className="text-xs text-muted-foreground">PDF, JPG, PNG, or WEBP · Maximum 8 MB</p>
                {attachmentError && <p role="alert" className="text-sm text-destructive">{attachmentError}</p>}
                {attachment && <div className="flex items-center gap-3 rounded-lg border p-3">
                  {attachmentPreview ? <img src={attachmentPreview} alt="Selected report photo preview" className="h-16 w-16 rounded-md object-cover" /> : <span className="flex h-12 w-12 items-center justify-center rounded-md bg-muted"><FileText className="h-5 w-5" /></span>}
                  <div className="min-w-0 flex-1 text-sm"><p className="truncate font-medium">{attachment.name}</p><p className="text-muted-foreground">{(attachment.size / 1024 / 1024).toFixed(1)} MB · Ready to attach</p></div>
                  <Button type="button" size="sm" variant="ghost" aria-label="Remove attachment" onClick={() => { chooseAttachment(); setAttachmentInputKey((key) => key + 1); }}><X className="h-4 w-4" /></Button>
                </div>}
              </div>

              <Button type="submit" disabled={submitting || categoryOptions.length === 0 || Boolean(categoryLoadError) || Boolean(attachmentError)} className="w-full sm:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                    <><Upload className="h-4 w-4" />Submit Report</>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
        <p className="mt-4 text-sm text-muted-foreground">Want to check a previous report? <Link href="/account/submissions" className="font-medium text-primary hover:underline">View my submissions</Link></p>
      </div>
    </div>
  );
}
