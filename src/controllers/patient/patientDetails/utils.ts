export const predictionResponse = (prediction: any, patient: any) => {
  const analysis = [];

  if (prediction) {
    analysis.push({
      key: "DARK CIRCLES",
      value: !prediction?.dark_circle?.detected
        ? "Prediction not successful for dark circle"
        : prediction?.dark_circle?.detected?.toLowerCase() === "yes"
          ? "Dark circle is visible"
          : "Dark circle is not visible",

      image: covertBase64(prediction?.dark_circle_output),
      comment: patient?.dark_circle_comment,
    });

    analysis.push({
      key: "PUPIL COMPARISON",
      value: !prediction?.pupil_comparison?.percentage_difference
        ? "Prediction not successful for pupils"
        : prediction?.pupil_comparison?.result,

      image: covertBase64(prediction?.pupil_comparison_output),
      comment: patient?.pupil_comparison_comment,
    });

    analysis.push({
      key: "NOSE WIDTH",
      value: !prediction?.nose_shape?.detected
        ? "Prediction not successful for nose width"
        : prediction?.nose_shape?.nose_shape_info?.nose_shape
              ?.toLowerCase()
              ?.includes("cannot calculated")
          ? "Prediction not successful for nose width"
          : [
              "Nose is",
              prediction?.nose_shape?.nose_shape_info?.nose_shape,
              "with",
              isNaN(prediction?.nose_shape?.nose_shape_info?.nose_percentage)
                ? prediction?.nose_shape?.nose_shape_info?.nose_percentage
                : `${Math.round(
                    parseFloat(
                      prediction?.nose_shape?.nose_shape_info?.nose_percentage,
                    ),
                  )} %`,
            ].join(" "),

      image: covertBase64(prediction?.nose_shape_output),
      comment: patient?.nose_shape_comment,
    });

    analysis.push({
      key: "NOSTRIL VISIBILITY",
      value: !prediction?.nostril?.segmented
        ? "Prediction not success for nostrils"
        : prediction?.nostril?.segmented?.toLowerCase() === "yes"
          ? "Nostrils are visible"
          : "Nostrils are not visible",

      image: covertBase64(prediction?.nostril_output),
      comment: patient?.nostril_comment,
    });

    analysis.push({
      key: "PUPIL ALIGNMENT",
      value: !prediction?.mouth_alignment
        ? "Prediction not successful for mouth and pupils"
        : prediction?.mouth_alignment?.mouth_result,

      image: covertBase64(prediction?.mouth_alignment_output),
      comment: patient?.mouth_alignment_comment,
    });
  }

  analysis.push({
    key: "PUPIL LEVEL ALIGNMENT",
    value: !prediction?.pupil_alignment
      ? "Prediction not successful for pupils"
      : prediction?.pupil_alignment?.result,

    image: covertBase64(prediction?.pupil_alignment_output),
    comment: patient?.pupil_alignment_comment,
  });

  return {
    id: patient?.id,
    input_image: covertBase64(prediction?.input_image),
    image_id: patient?.image_id,
    name: patient?.name,
    user_id: patient?.user_id,
    createdAt: patient?.createdAt,
    updatedAt: patient?.updatedAt,

    analysis,
  };
};

const covertBase64 = (key: string) =>
  key ? Buffer.from(key).toString("base64") : null;
