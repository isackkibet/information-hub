"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FormField, FormTextarea, FormSelect } from "@/components/forms/form-field";
import { Card, CardContent } from "@/components/ui/card";
import { categories } from "@/data";
import { fileUploadService } from "@/frontend/services";
import { useToast } from "@/components/ui/toast";
import { CheckCircle, FileText, Loader2 } from "lucide-react";

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
    setTimeout(() => {
      setSubmitting(false);
      setSent(true);
      toast("Report submitted successfully (demo)", "success");
    }, 800);
  };

  const handleUpload = async () => {
    const res = await fileUploadService.upload();
    if (res.reason) toast(res.reason, "info");
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
                <p className="text-sm text-muted-foreground">Demo confirmation. Not stored permanently.</p>
              </div>
            </div>
            <div className="mt-4 space-y-2 rounded-lg bg-muted p-4 text-sm">
              <p><span className="font-medium">Title:</span> {form.title}</p>
              <p><span className="font-medium">Category:</span> {categories.find(c => c.id === form.category)?.name}</p>
              <p><span className="font-medium">Location:</span> {form.location || "Not specified"}</p>
            </div>
            <div className="mt-4 flex gap-2">
              <Button onClick={() => { setForm(EMPTY); setSent(false); }}>Submit another report</Button>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Reports are not permanently stored without a backend. Connect a storage service to persist
              submissions.
            </p>
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
                {categories.filter((c) => c.enabled).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </FormSelect>
              <FormField
                label="Location"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="County or area (optional)"
                hint="Helps reviewers identify the area affected"
              />
              <div className="space-y-1.5">
                <p className="text-sm font-medium">Attachment (Demo)</p>
                <div className="flex items-center gap-2">
                  <Button type="button" variant="outline" onClick={handleUpload}>
                    <FileText className="h-4 w-4" />
                    Attach file
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  File uploads are not configured. Attachments are not stored.
                </p>
              </div>

              <Button type="submit" disabled={submitting} className="w-full sm:w-auto">
                {submitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report (Demo)"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
