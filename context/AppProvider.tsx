import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { auth, db, isFirebaseConfigured } from "../firebaseConfig";
import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc, query, where, or, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export type Note = {
  id: string;
  title: string;
  content: string;
  folderId: string | "all";
  isLocked: boolean;
  pin?: string;
  isPinned: boolean;
  isTrash: boolean;
  updatedAt: string;
  sharedType?: "with_me" | "by_me" | null;
  dueDate?: string | null;
  notificationId?: string | null;
  ownerId?: string; // 🌟 สำหรับระบุเจ้าของเมื่อใช้ Firebase
  collaborators?: string[]; // 🌟 เก็บ Email ของคนที่สามารถเข้ามาแก้ไขด้วยได้
};

export type Folder = {
  id: string;
  name: string;
  color: string;
  icon: string;
};

type AppContextType = {
  notes: Note[];
  folders: Folder[];
  currentFolderId: string | "all";
  setCurrentFolderId: (id: string | "all") => void;
  addNote: (note: Omit<Note, "id" | "updatedAt">) => void;
  updateNote: (id: string, updates: Partial<Note>) => void;
  deleteNote: (id: string) => void;
  addFolder: (name: string) => void;
  updateFolder: (id: string, name: string) => void;
  deleteFolder: (id: string) => void;
  emptyTrash: () => void;
  currentUserEmail: string | null;
  userProfilePic: string;
  setUserProfilePic: (url: string) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [currentFolderId, setCurrentFolderId] = useState<string | "all">("all");
  const [notes, setNotes] = useState<Note[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [userProfilePic, setUserProfilePic] = useState<string>("https://i.pravatar.cc/150?img=3");

  // ฟังการเปลี่ยนแปลงของ User (Log inside / out)
  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribeAuth = onAuthStateChanged(auth, async (u) => {
        setUser(u);
        if (u) {
          if (u.photoURL) setUserProfilePic(u.photoURL);
          if (db) {
            try {
              const userDoc = await getDoc(doc(db, "users", u.uid));
              if (userDoc.exists() && userDoc.data().photoURL) {
                setUserProfilePic(userDoc.data().photoURL);
              }
            } catch (e) {
              console.log("Could not fetch user profile from firestore");
            }
          }
        }
      });
      return () => unsubscribeAuth();
    } else {
      // Mock mode fallback
      AsyncStorage.getItem("@swiftnotes_profile_pic").then(val => {
        if (val) setUserProfilePic(val);
      });
    }
  }, []);

  // โหลด Data
  useEffect(() => {
    let unsubscribeNotes = () => {};

    const loadData = async () => {
      try {
        const { status } = await Notifications.requestPermissionsAsync();
        if (status !== "granted") console.log("Noti permission not granted");

        // ถ้าเชื่อต่อกับ Firebase แล้ว และมี User Login อยู่
        if (isFirebaseConfigured && db && user) {
          const notesRef = collection(db, "notes");
          const q = query(
            notesRef,
            or(
              where("ownerId", "==", user.uid),
              where("collaborators", "array-contains", user.email || "")
            )
          );
          
          // ดึงแบบ Real-time
          unsubscribeNotes = onSnapshot(q, (snapshot) => {
            const firebaseNotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Note));
            setNotes(firebaseNotes.sort((a,b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            setIsLoaded(true);
          });
        } 
        // fallback กรณีเป็น MockMode 
        else if (!isFirebaseConfigured) {
          const savedNotes = await AsyncStorage.getItem("@swiftnotes_notes");
          const savedFolders = await AsyncStorage.getItem("@swiftnotes_folders");

          if (savedNotes) {
            setNotes(JSON.parse(savedNotes));
          } else {
            setNotes([{ id: "welcome1", title: "Welcome to SwiftNotes! 🎉", content: "Try creating a new note or folder.", folderId: "all", isLocked: false, isPinned: true, isTrash: false, updatedAt: new Date().toISOString() }]);
          }

          if (savedFolders) {
            setFolders(JSON.parse(savedFolders));
          } else {
            setFolders([{ id: "1", name: "Work", color: "blue", icon: "work" }, { id: "2", name: "Personal", color: "emerald", icon: "person" }]);
          }
          setIsLoaded(true);
        } else {
          setIsLoaded(true); // Firebase is configured, but no user 
        }
      } catch (error) {
        console.error("Failed to load data", error);
        setIsLoaded(true);
      }
    };
    loadData();

    return () => unsubscribeNotes();
  }, [user]);

  // Back-up เฉพาะ Mock Mode ลงในเครื่อง
  useEffect(() => {
    if (isLoaded && !isFirebaseConfigured) {
      AsyncStorage.setItem("@swiftnotes_notes", JSON.stringify(notes));
      AsyncStorage.setItem("@swiftnotes_folders", JSON.stringify(folders));
    }
  }, [notes, folders, isLoaded]);

  const addNote = async (noteData: Omit<Note, "id" | "updatedAt">) => {
    const newNote: Note = {
      ...noteData,
      id: Date.now().toString(),
      updatedAt: new Date().toISOString(),
      ownerId: user?.uid || "mock_uid",
      collaborators: noteData.collaborators || [],
    };
    
    if (isFirebaseConfigured && db) {
      await setDoc(doc(db, "notes", newNote.id), newNote);
    } else {
      setNotes([newNote, ...notes]);
    }
  };

  const updateNote = async (id: string, updates: Partial<Note>) => {
    if (isFirebaseConfigured && db) {
      await updateDoc(doc(db, "notes", id), { ...updates, updatedAt: new Date().toISOString() });
    } else {
      setNotes(notes.map((n) => (n.id === id ? { ...n, ...updates, updatedAt: new Date().toISOString() } : n)));
    }
  };

  const deleteNote = async (id: string) => {
    if (isFirebaseConfigured && db) {
      await deleteDoc(doc(db, "notes", id));
    } else {
      setNotes(notes.filter((n) => n.id !== id));
    }
  };

  const addFolder = (name: string) => {
    const newFolder: Folder = { id: Date.now().toString(), name, color: "indigo", icon: "folder" };
    setFolders([...folders, newFolder]);
  };
  const updateFolder = (id: string, name: string) => {
    setFolders(folders.map((f) => (f.id === id ? { ...f, name } : f)));
  };
  const deleteFolder = (id: string) => {
    setFolders(folders.filter((f) => f.id !== id));
    if (isFirebaseConfigured && db) {
      notes.forEach(n => { if(n.folderId === id) updateDoc(doc(db, "notes", n.id), { folderId: "all" }) });
    } else {
      setNotes(notes.map((n) => (n.folderId === id ? { ...n, folderId: "all" } : n)));
    }
    if (currentFolderId === id) setCurrentFolderId("all");
  };

  const emptyTrash = () => {
    if (isFirebaseConfigured && db) {
      notes.filter(n => n.isTrash).forEach(n => deleteDoc(doc(db, "notes", n.id)));
    } else {
      setNotes(notes.filter((n) => !n.isTrash));
    }
  };

  if (!isLoaded) return null;

  return (
    <AppContext.Provider value={{ notes, folders, currentFolderId, setCurrentFolderId, addNote, updateNote, deleteNote, addFolder, updateFolder, deleteFolder, emptyTrash, currentUserEmail: user?.email || null, userProfilePic, setUserProfilePic }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) throw new Error("useAppContext must be used within an AppProvider");
  return context;
}
