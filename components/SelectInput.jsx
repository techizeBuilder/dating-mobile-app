import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import ModalSelector from "react-native-modal-selector";
import GradientInput from "./GradientInput";
import { ChevronDown } from "lucide-react-native";

const SelectInput = ({
  label,
  value,
  onValueChange,
  items,
  placeholder = "Select an option",
  disabled = false,
  error = null,
  style: customStyle = {},
}) => {
  const formattedItems = [
    { key: -1, label: placeholder, section: true },
    ...items.map((item, index) => ({
      key: index,
      label: item.label,
      value: item.value,
    })),
  ];

  return (
    <View style={[styles.inputGroup, customStyle]}>
      {label && <Text style={styles.label}>{label}</Text>}

      <GradientInput
        hasError={!!error}
        variant="select"
        style={styles.gradientInput}
      >
        <ModalSelector
          data={formattedItems}
          initValue={placeholder}
          onChange={(option) => onValueChange(option.value)}
          disabled={disabled}
          animationType="fade"
          overlayStyle={styles.modalOverlay}
          optionContainerStyle={styles.modalOptionContainer}
          optionTextStyle={styles.modalOptionText}
          optionStyle={styles.modalOptionItem}
          sectionTextStyle={styles.modalSectionText}
          selectStyle={styles.selectStyle}
          selectTextStyle={value ? styles.selectedText : styles.placeholderText}
          backdropPressToClose={true}
          cancelText=""
          cancelStyle={styles.hiddenCancel}
        >
          <TouchableOpacity style={styles.selectorRow}>
            <Text style={value ? styles.selectedText : styles.placeholderText}>
              {value || placeholder}
            </Text>
            <ChevronDown size={18} color="#00FFFF" />
          </TouchableOpacity>
        </ModalSelector>
      </GradientInput>

      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  inputGroup: {
    flex: 1,
    marginBottom: 16,
    minWidth: 150,
  },
  label: {
    fontSize: 14,
    color: "#FF00FF",
    fontFamily: "Rajdhani-SemiBold",
    marginBottom: 8,
  },
  gradientInput: {
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  errorText: {
    color: "#ff4444",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 4,
  },
  modalOverlay: {
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalOptionContainer: {
    backgroundColor: "#062626",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#00FFFF",
    overflow: "hidden",
  },
  modalOptionItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
    borderTopWidth: 0,
  },

  modalOptionText: {
    color: "#FFFFFF",
    fontSize: 16,
    paddingVertical: 10,
    fontFamily: "Rajdhani-SemiBold",
  },

  modalSectionText: {
    color: "#00FFFF",
    fontSize: 20,
    fontFamily: "Rajdhani-Bold",
    width: "100%",
  },
  selectorRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  hiddenCancel: {
    height: 0,
    padding: 0,
    margin: 0,
    borderWidth: 0,
  },

  selectedText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Rajdhani-SemiBold",
  },

  placeholderText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Rajdhani-SemiBold",
  },

  selectStyle: {
    borderWidth: 0,
  },
});

export default SelectInput;
