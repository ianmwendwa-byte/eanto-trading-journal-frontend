import { useState, useEffect } from "react"
import { toast } from "sonner"

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from "@/components/ui/sheet"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { useAuth } from "@/app/context/AuthContext"

export function ProfileSheet({ open, onOpenChange }) {
  const { user, updateProfile } = useAuth()

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  })

  const [errors, setErrors] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  // ─────────────────────────────────────────────
  // Populate form from user
  // ─────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      })
    }
  }, [user])

  // ─────────────────────────────────────────────
  // Handle input change
  // ─────────────────────────────────────────────
  const handleChange = (e) => {
    const { name, value } = e.target

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  // ─────────────────────────────────────────────
  // Validation
  // ─────────────────────────────────────────────
  const validate = () => {
    const newErrors = {}

    if (!form.firstName.trim()) {
      newErrors.firstName = "First name is required"
    }

    if (!form.lastName.trim()) {
      newErrors.lastName = "Last name is required"
    }

    if (!form.email.includes("@")) {
      newErrors.email = "Enter a valid email"
    }

    setErrors(newErrors)

    return Object.keys(newErrors).length === 0
  }

  // ─────────────────────────────────────────────
  // Submit
  // ─────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validate()) return

    setIsLoading(true)

    try {
      await updateProfile(form)

      toast.success("Profile updated successfully")

      onOpenChange(false) // close sheet
    } catch (err) {
      toast.error(err?.message || "Update failed")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">

        {/* Header */}
        <SheetHeader>
          <SheetTitle>Edit Profile</SheetTitle>
          <SheetDescription>
            Update your account information
          </SheetDescription>
        </SheetHeader>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-4 px-4"
        >
          {/* First Name */}
          <div className="flex flex-col gap-1">
            <Label>First Name</Label>
            <Input
              name="firstName"
              value={form.firstName}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.firstName && (
              <span className="text-sm text-red-500">
                {errors.firstName}
              </span>
            )}
          </div>

          {/* Last Name */}
          <div className="flex flex-col gap-1">
            <Label>Last Name</Label>
            <Input
              name="lastName"
              value={form.lastName}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.lastName && (
              <span className="text-sm text-red-500">
                {errors.lastName}
              </span>
            )}
          </div>

          {/* Email */}
          <div className="flex flex-col gap-1">
            <Label>Email</Label>
            <Input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            {errors.email && (
              <span className="text-sm text-red-500">
                {errors.email}
              </span>
            )}
          </div>

          {/* Footer */}
          <SheetFooter className="mt-4">
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </SheetFooter>
        </form>

      </SheetContent>
    </Sheet>
  )
}