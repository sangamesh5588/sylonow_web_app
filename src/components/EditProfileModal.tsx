import { useState, FormEvent } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X } from "lucide-react";
import { toast } from "sonner";
import { Button, Input } from "./ui";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EditProfileModal = ({ isOpen, onClose }: EditProfileModalProps) => {
  const { user, profile, refreshProfile } = useAuth();
  const [name, setName] = useState(profile?.full_name || "");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Name cannot be empty");
      return;
    }

    if (!user?.id) return;

    const { error } = await supabase
      .from("user_profiles")
      .update({ full_name: name.trim() })
      .eq("auth_user_id", user.id);

    if (error) {
      toast.error("Failed to update profile");
      return;
    }

    await refreshProfile();
    toast.success("Profile updated successfully");
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-[#101828]/35 backdrop-blur-[2px]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", stiffness: 260, damping: 24 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-[32px] bg-white p-6 shadow-2xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-2xl font-bold text-[#0B4964]">Edit Profile</h2>
                <p className="mt-1 text-sm text-gray-500">Update your account information</p>
              </div>
              <button onClick={onClose} className="rounded-full p-2 text-gray-400 hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-[#344054]">Full Name</label>
                <Input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  autoFocus
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-[#344054]">Phone Number</label>
                <Input
                  type="text"
                  value={profile?.phone_number || ""}
                  disabled
                  className="bg-gray-50 cursor-not-allowed"
                />
                <p className="mt-1 text-xs text-gray-500">Phone number cannot be changed</p>
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1 bg-[#0B4964] hover:bg-[#08384e]">
                  Save Changes
                </Button>
              </div>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
