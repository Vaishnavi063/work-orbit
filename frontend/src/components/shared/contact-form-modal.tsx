import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Loader2, Mail, MessageSquare, User } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
    type ContactFormModalProps,
    type ContactFormSchema,
    type ContactRequest,
    contactFormSchema,
} from "@/types/contact";
import { submitContactForm } from "@/apis/contact";
import useAuth from "@/hooks/use-auth";
import type { ApiError } from "@/types";

export function ContactFormModal({
    isOpen,
    onClose,
    userEmail,
}: ContactFormModalProps) {
    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const { user, authToken } = useAuth();

    // Determine user type based on whether userEmail is provided or user is authenticated
    const userType = userEmail || user ? "logged_in" : "guest";
    const effectiveUserEmail = userEmail || user?.email;

    const form = useForm<ContactFormSchema>({
        resolver: zodResolver(contactFormSchema),
        defaultValues: {
            email: effectiveUserEmail || "",
            subject: "",
            message: "",
            userType,
        },
    });

    // Reset form when modal opens/closes or user data changes
    React.useEffect(() => {
        if (isOpen) {
            form.reset({
                email: effectiveUserEmail || "",
                subject: "",
                message: "",
                userType,
            });
        }
    }, [isOpen, effectiveUserEmail, userType, form]);

    const onSubmit = async (data: ContactFormSchema) => {
        setIsSubmitting(true);

        try {
            // Prepare the contact request data
            const contactRequest: ContactRequest = {
                email: data.email,
                subject: data.subject,
                message: data.message,
                userType: data.userType,
                userId: user?.id,
                submittedAt: new Date(),
            };

            // Submit the contact form
            await submitContactForm(contactRequest, authToken);

            // Show success toast
            toast.success("Message sent successfully!", {
                description:
                    "We've received your message and will get back to you soon.",
                duration: 5000,
            });

            // Close modal and reset form on successful submission
            onClose();
            form.reset();
        } catch (error) {
            console.error("Failed to submit contact form:", error);

            // Extract error message from API response
            const apiError = error as ApiError;
            const errorMessage =
                apiError?.response?.data?.error?.message ||
                "Failed to send message. Please try again.";

            // Show error toast
            toast.error("Failed to send message", {
                description: errorMessage,
                duration: 5000,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleClose = () => {
        if (isSubmitting) {
            return; // Prevent closing during submission
        }

        // Check if user has entered any data
        const formValues = form.getValues();
        const hasData =
            formValues.subject.trim() ||
            formValues.message.trim() ||
            (formValues.email.trim() && !effectiveUserEmail);

        if (hasData) {
            // Show confirmation before closing with data
            const shouldClose = window.confirm(
                "You have unsaved changes. Are you sure you want to close without sending your message?"
            );
            if (!shouldClose) {
                return; // Don't close if user cancels
            }
        }

        onClose();
        form.reset();
    };

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <MessageSquare className="size-5" />
                        Contact Us
                    </DialogTitle>
                    <DialogDescription>
                        Have a question, found an issue, or need help? We're
                        here to assist you. Fill out the form below and we'll
                        get back to you as soon as possible.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form
                        onSubmit={form.handleSubmit(onSubmit)}
                        className="space-y-4"
                    >
                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="flex items-center gap-2">
                                        <Mail className="size-4" />
                                        Email Address
                                    </FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="your.email@example.com"
                                            type="email"
                                            disabled={
                                                isSubmitting ||
                                                !!effectiveUserEmail
                                            }
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                    {effectiveUserEmail && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <User className="size-3" />
                                            Using your account email
                                        </p>
                                    )}
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Subject</FormLabel>
                                    <FormControl>
                                        <Input
                                            placeholder="Brief description of your inquiry"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="message"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Message</FormLabel>
                                    <FormControl>
                                        <Textarea
                                            placeholder="Please provide details about your question, issue, or feedback..."
                                            className="min-h-24 resize-none"
                                            disabled={isSubmitting}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                            >
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                                {isSubmitting && (
                                    <Loader2 className="size-4 animate-spin" />
                                )}
                                Send Message
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
