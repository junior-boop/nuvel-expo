import { StyleSheet } from "react-native";

export const CardStyles = StyleSheet.create({
  content: {},
  header: {
    height: 96,
    paddingHorizontal: 16,
  },
});

export const HeaderStyles = StyleSheet.create({
  container: {
    height: 96,
    paddingHorizontal: 16,
    paddingBottom: 16,
    justifyContent: "flex-end",
  },
  image: {
    height: 28,
    resizeMode: "contain",
    width: 100,
  },
});

export const NewNoteButton = StyleSheet.create({
  button: {
    width: 60,
    height: 60,
    borderRadius: "50%",
    elevation: 3,
    backgroundColor: "#3B82F6",
    alignItems: "center",
    justifyContent: "center",
  },
  container: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: 96,
    width: "100%",
    flexDirection: "row",
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "flex-end",
  },
});
