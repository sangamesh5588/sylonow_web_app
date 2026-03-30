import { useEffect, useState, FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Plus, Trash2, Edit2 } from "lucide-react";
import { motion } from "motion/react";
import { toast } from "sonner";
import { useAuth } from "../contexts/AuthContext";
import { readAddresses, writeAddresses } from "../lib/booking";
import { Address } from "../types";
import { Button, Card, Input } from "../components/ui";
import { AddressDraft, AddressPicker } from "../components/address/AddressPicker";

const Addresses = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, setShowLoginModal } = useAuth();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<AddressDraft>({
    label: "Home",
    fullAddress: "",
    city: "",
    pincode: "",
    latitude: undefined,
    longitude: undefined,
    placeId: undefined,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      navigate("/profile");
      return;
    }

    const userAddresses = readAddresses(user?.phoneNumber);
    setAddresses(userAddresses);
  }, [user, isAuthenticated, navigate, setShowLoginModal]);

  const resetForm = () => {
    setForm({
      label: "Home",
      fullAddress: "",
      city: "",
      pincode: "",
      latitude: undefined,
      longitude: undefined,
      placeId: undefined,
    });
    setEditingId(null);
    setShowForm(false);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!user?.phoneNumber) return;

    if (!form.houseNumber || !form.fullAddress || !form.city || !form.pincode) {
      toast.error("Please fill all fields");
      return;
    }

    if (editingId) {
      // Edit existing
      const updated = addresses.map((addr) =>
        addr.id === editingId ? { ...addr, ...form } : addr
      );
      setAddresses(updated);
      writeAddresses(user.phoneNumber, updated);
      toast.success("Address updated");
    } else {
      // Add new
      const newAddress: Address = {
        id: `address-${Date.now()}`,
        ...form,
      };
      const updated = [newAddress, ...addresses];
      setAddresses(updated);
      writeAddresses(user.phoneNumber, updated);
      toast.success("Address added");
    }

    resetForm();
  };

  const handleEdit = (address: Address) => {
    setForm({
      label: address.label,
      fullAddress: address.fullAddress,
      city: address.city,
      pincode: address.pincode,
      latitude: address.latitude,
      longitude: address.longitude,
      placeId: address.placeId,
    });
    setEditingId(address.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!user?.phoneNumber) return;

    const updated = addresses.filter((addr) => addr.id !== id);
    setAddresses(updated);
    writeAddresses(user.phoneNumber, updated);
    toast.success("Address deleted");
  };

  if (!isAuthenticated) return null;

  return (
    <div className="space-y-8 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white shadow-sm ring-1 ring-[#eadfdb] transition-all active:scale-90"
          >
            <ChevronLeft size={22} className="text-[#0B4964]" />
          </button>
          <div>
            <p className="text-sm font-medium text-[#FB2965]">Manage</p>
            <h1 className="text-2xl font-bold tracking-tight text-[#0B4964]">
              Saved Addresses
            </h1>
          </div>
        </div>
        <Button
          variant="gradient"
          size="sm"
          onClick={() => setShowForm(!showForm)}
        >
          <Plus size={16} className="mr-2" />
          Add New
        </Button>
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
        >
          <Card className="p-6 border border-[#f0e7e2]">
            <h3 className="text-lg font-bold text-[#0B4964] mb-4">
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-[#344054]">
                    Label
                  </label>
                  <Input
                    value={form.label}
                    onChange={(e) => setForm({ ...form, label: e.target.value })}
                    placeholder="Home, Office, etc."
                  />
                </div>
              </div>
              <AddressPicker value={form} onChange={setForm} />
              <div className="flex gap-3">
                <Button type="submit" className="flex-1 bg-[#0B4964]">
                  {editingId ? "Update" : "Save"} Address
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetForm}
                  className="flex-1"
                >
                  Cancel
                </Button>
              </div>
            </form>
          </Card>
        </motion.div>
      )}

      {/* Addresses List */}
      {addresses.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center justify-center py-16 text-center space-y-6"
        >
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
            <MapPin size={48} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-[#0B4964]">No saved addresses</h2>
            <p className="text-gray-500">Add an address to get started</p>
          </div>
          <Button variant="gradient" onClick={() => setShowForm(true)}>
            Add Your First Address
          </Button>
        </motion.div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {addresses.map((address, index) => (
            <motion.div
              key={address.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 border border-[#f0e7e2]">
                <div className="flex items-start gap-4">
                  <div className="mt-1 text-[#FB2965]">
                    <MapPin size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-[#0B4964]">{address.label}</h3>
                    <p className="mt-1 text-sm text-gray-600">{address.fullAddress}</p>
                    <p className="text-sm text-gray-600">
                      {address.city} - {address.pincode}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleEdit(address)}
                  >
                    <Edit2 size={14} className="mr-2" />
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50"
                    onClick={() => handleDelete(address.id)}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Addresses;
