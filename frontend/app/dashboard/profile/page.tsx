"use client";

import { useState, useEffect } from "react";
import { supabase } from "../../../supabase_client";
import { TextField, Button, Typography, Box, Paper, Avatar, Divider } from "@mui/material";
import bcrypt from "bcryptjs";
import AuthGuard from "../../../components/AuthGuard";
import { useRouter } from "next/navigation";

const ProfilePageContent = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const sage = "#889977";

  const router = useRouter();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) return;

        const { data: userData, error } = await supabase
          .from("users")
          .select("username, email, avatar_url")
          .eq("id", session.user.id)
          .single();

        if (error) {
          setMessage("Failed to fetch profile.");
          return;
        }

        setUsername(userData?.username || "");
        setEmail(userData?.email || "");
        setAvatarUrl(userData?.avatar_url || null);

      } catch (err: any) {
        setMessage(err.message || "Something went wrong!");
      }
    };

    fetchUser();
  }, []);

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files?.length) return;
    const file = event.target.files[0];
    const fileExt = file.name.split(".").pop();
    const fileName = `${Math.random()}.${fileExt}`;

    setLoading(true);
    const { error: uploadError } = await supabase.storage.from("avatars").upload(fileName, file);

    if (uploadError) setMessage(uploadError.message);
    else {
      const { data } = supabase.storage.from("avatars").getPublicUrl(fileName);
      setAvatarUrl(data.publicUrl);
      setMessage("Avatar uploaded!");
    }
    setLoading(false);
  };

  const handleUpdate = async () => {
    setLoading(true);
    setMessage("");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setMessage("No active session found.");
        setLoading(false);
        return;
      }

      const updates: any = { username, email };
      if (password) updates.hashed_password = bcrypt.hashSync(password, 10);
      if (avatarUrl) updates.avatar_url = avatarUrl;

      const { error } = await supabase.from("users").update(updates).eq("id", session.user.id);
      if (error) setMessage(error.message);
      else setMessage("Profile updated successfully!");
    } catch (err: any) {
      setMessage(err.message || "Something went wrong!");
    }
    setLoading(false);
  };

  return (
    <Box sx={{ minHeight: "100vh", background: "linear-gradient(135deg, #0f0f12 0%, #1a1a1f 100%)", py: 6, px: 2 }}>
      <Paper
        sx={{
          maxWidth: 800,
          margin: "0 auto",
          p: 5,
          borderRadius: 4,
          background: "rgba(17,17,17,0.55)",
          backdropFilter: "blur(16px)",
          border: `1px solid ${sage}55`,
          boxShadow: "0 16px 48px rgba(0,0,0,0.7)",
          display: "flex",
          flexWrap: "wrap",
          gap: 4,
        }}
      >
        {/* Back Button */}
        <Box sx={{ width: "100%", mb: 2 }}>
          <Button
            variant="outlined"
            sx={{
              color: sage,
              borderColor: sage,
              "&:hover": { backgroundColor: sage, color: "#000", borderColor: sage },
            }}
            onClick={() => router.back()}
          >
            Back
          </Button>
        </Box>

        {/* Avatar Section */}
        <Box sx={{ flex: "1 1 250px", textAlign: "center" }}>
          <Avatar src={avatarUrl || undefined} sx={{ width: 120, height: 120, margin: "0 auto", mb: 2 }} />
          <Button
            variant="outlined"
            component="label"
            sx={{
              color: sage,
              borderColor: sage,
              "&:hover": { backgroundColor: sage, color: "#000", borderColor: sage },
            }}
          >
            Change Avatar
            <input type="file" hidden onChange={handleAvatarUpload} />
          </Button>
        </Box>

        {/* Account Info */}
        <Box sx={{ flex: "2 1 400px" }}>
          <Typography variant="h6" sx={{ color: sage, mb: 2 }}>
            Account Information
          </Typography>

          <TextField
            label="Username"
            fullWidth
            sx={{
              mb: 2,
              input: {
                color: "#fff",
                background: "#111",
                "&:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px #111 inset",
                  WebkitTextFillColor: "#fff",
                },
              },
              label: { color: "#ccc" },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": { borderColor: sage, boxShadow: `0 0 12px ${sage}66` },
              },
            }}
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />

          <TextField
            label="Email"
            fullWidth
            sx={{
              mb: 2,
              input: {
                color: "#fff",
                background: "#111",
                "&:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px #111 inset",
                  WebkitTextFillColor: "#fff",
                },
              },
              label: { color: "#ccc" },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": { borderColor: sage, boxShadow: `0 0 12px ${sage}66` },
              },
            }}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <Divider sx={{ my: 3, borderColor: sage }} />

          <Typography variant="h6" sx={{ color: sage, mb: 2 }}>
            Change Password
          </Typography>

          <TextField
            label="New Password"
            type="password"
            fullWidth
            sx={{
              mb: 3,
              input: {
                color: "#fff",
                background: "#111",
                "&:-webkit-autofill": {
                  WebkitBoxShadow: "0 0 0 1000px #111 inset",
                  WebkitTextFillColor: "#fff",
                },
              },
              label: { color: "#ccc" },
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
                "&.Mui-focused fieldset": { borderColor: sage, boxShadow: `0 0 12px ${sage}66` },
              },
            }}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            variant="contained"
            fullWidth
            sx={{
              backgroundColor: sage,
              color: "#000",
              fontWeight: "bold",
              py: 1.5,
              "&:hover": { backgroundColor: "#000", color: sage, border: `1px solid ${sage}` },
            }}
            onClick={handleUpdate}
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Profile"}
          </Button>

          {message && (
            <Typography sx={{ mt: 2, color: sage, textAlign: "center", fontWeight: 500 }}>
              {message}
            </Typography>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

const ProfilePage = () => (
  <AuthGuard>
    <ProfilePageContent />
  </AuthGuard>
);

export default ProfilePage;
