import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Axios from "axios";
import { JsonToTable } from "react-json-to-table";
import { Table, Form, Container, Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { map } from "lodash";

const ReviewPage = (props: any) => {
  // application form states
  const { orderId } = useParams();
  const [loanApplication, setLoanApplication] = useState<any>({});

  // review states
  const [status, setStatus] = useState<string>();
  const [review, setReview] = useState<string>("");
  const [updateTargets, setUpdateTargets] = useState<string[]>([]);
  const navigateTo = useNavigate();
  const formFields = useMemo(
    () => [
      {
        label: "Project Type",
        key: "project_type",
        value: false,
      },
      {
        label: "District",
        key: "district",
        value: false,
      },
      {
        label: "Block",
        key: "block",
        value: false,
      },
      {
        label: "Branch",
        key: "branch",
        value: false,
      },
      {
        label: "Loan Amount",
        key: "loan_amount",
        value: false,
      },
      {
        label: "First Name",
        key: "first_name",
        value: false,
      },
      {
        label: "Middle Name",
        key: "middle_name",
        value: false,
      },
      {
        label: "Last Name",
        key: "last_name",
        value: false,
      },
      {
        label: "Gender",
        key: "gender",
        value: false,
      },
      {
        label: "Marital Status",
        key: "marital_status",
        value: false,
      },
      {
        label: "Age",
        key: "age",
        value: false,
      },
      {
        label: "Mothers Name",
        key: "mothers_name",
        value: false,
      },
      {
        label: "Fathers Name",
        key: "fathers_name",
        value: false,
      },
      {
        label: "Date Of Birth",
        key: "date_of_birth",
        value: false,
      },
      {
        label: "Educational Qualitfication",
        key: "educational_qualitfication",
        value: false,
      },
      {
        label: "PAN Number",
        key: "PAN_Number",
        value: false,
      },
      {
        label: "Aadhar Number",
        key: "Aadhar_Number",
        value: false,
      },
      {
        label: "Address",
        key: "Address",
        value: false,
      },
      {
        label: "Pin Code",
        key: "Pin_Code",
        value: false,
      },
      {
        label: "Phone number",
        key: "Phone_number",
        value: false,
      },
      {
        label: "Email Id",
        key: "Email_Id",
        value: false,
      },
      {
        label: "Permanent Address",
        key: "Permanent_Address",
        value: false,
      },
      {
        label: "Permanent Pin Code",
        key: "Permanent_Pin_Code",
        value: false,
      },
      {
        label: "Permanent Phone number",
        key: "Permanent_Phone_number",
        value: false,
      },
      {
        label: "Permanent Email Id",
        key: "Permanent_Email_Id",
        value: false,
      },
      {
        label: "Agricultural Income Source",
        key: "Agricultural_Income_Source",
        value: false,
      },
      {
        label: "Agricultural Income",
        key: "Agricultural_Income",
        value: false,
      },
      {
        label: "Other Income Source",
        key: "Other_Income_Source",
        value: false,
      },
      {
        label: "Other Income",
        key: "Other_Income",
        value: false,
      },
      {
        label: "Total Income",
        key: "Total_Income",
        value: false,
      },
      {
        label: "Guarantor Name",
        key: "Guarantor_Name",
        value: false,
      },
      {
        label: "Relationship with Guarantor",
        key: "Relationship_with_Guarantor",
        value: false,
      },
      {
        label: "Mobile number of the guarantor",
        key: "Mobile_number_of_the_guarantor",
        value: false,
      },
      {
        label: "Email ID of the Guarantor",
        key: "Email_ID_of_the_Guarantor",
        value: false,
      },
      {
        label: "PAN card number of guarantor",
        key: "PAN_card_number_of_guarantor",
        value: false,
      },
    ],
    []
  );



  useEffect(() => {
    if (!localStorage.getItem('token')) {
      navigateTo('/')
    }
  }, []);

  useEffect(() => {
    Axios({
      //  url: `http://localhost:3004/applications/${orderId}`,
      url: `http://64.227.181.5:3010/applications/${orderId}`,
      method: "GET",
    }).then((res) => {
      console.log(res.data.data.loan_applications);
      setLoanApplication(res.data.data.loan_applications);
    });
  }, []);


  return (
    <div className="flex flex-col justify-center items-center min-h-screen">

      <div className="min-w-2/5 font-regular bg-white bg-opacity-70 rounded mb-16 mt-16">
        <Container>
          <Table bordered>
            <tbody>
              <tr>
                <td>Application ID</td>
                <td>{orderId}</td>
              </tr>
            </tbody>
          </Table>
        </Container>
      </div>

      <div className="min-w-2/5 font-regular bg-white bg-opacity-70 rounded mb-16 px-11 py-16">
        <div>
          <JsonToTable json={loanApplication} />
        </div>
        <div>
          <div>
            <label htmlFor="status"> Status </label>
            <select
              id="status"
              name="status"
              onChange={(e) => {
                console.log("status value on change: ", e.target.value);
                setStatus(e.target.value);
              }}
            >
              <option value="Pending Processing"> Pending Processing </option>
              <option value="Approved"> Approved </option>
              <option value="Needs further clarification">
                Needs further clarification
              </option>
              <option value="Rejected"> Rejected </option>
            </select>
          </div>
          <div>
            <label htmlFor="updateFields"> Select Fields To Update </label>
            <Table>
              <thead>
                <tr>
                  <th> Field </th>
                  <th> Should be updated? </th>
                </tr>
              </thead>
            </Table>

            <Table>
              <thead>
                <tr>
                  <th>Application Field</th>
                  <th>Issue</th>
                  <th>Request Updates</th>
                </tr>
              </thead>
              <tbody>
                {map(formFields, (field: { key: string; label: string }) => (
                  <tr key={field.label}>
                    <td>
                      <label className="block text-gray-700 text-md font-regular mb-2">
                        {field.label}
                      </label>
                    </td>
                    <td>
                      <Form.Control
                        type="text"
                        placeholder="Write your issue"
                      />
                    </td>
                    <td className="text-center">
                      <Form.Group
                        className="mb-3"
                        controlId="formBasicCheckbox"
                      >
                        <Form.Check
                          type="checkbox"
                          onChange={(e) => {
                            console.log("vvv hello:", { e });
                            if (e.target.checked) {
                              setUpdateTargets([...updateTargets, field.key]);
                            } else {
                              setUpdateTargets(
                                updateTargets.filter(
                                  (item) => item !== field.key
                                )
                              );
                            }
                          }}
                        />
                      </Form.Group>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          <div>
            <Form>
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Review</Form.Label>
                <Form.Control type="text"
                  id="review"
                  name="review"
                  onChange={(e) => setReview(e.target.value)} />

              </Form.Group>
            </Form>

          </div>
          <div className="d-grid gap-2">
            <Button variant="primary" size="lg" type="submit" onClick={(e) => {
              const payload = {
                review: review,
                status: status,
                update_targets: updateTargets,
              };
              Axios({
                method: "POST",
                //url: `http://localhost:3004/applications/review/${orderId}`,
                url: `http://64.227.181.5:3010/applications/review/${orderId}`,
                data: payload,
              }).then((res) => {
                alert(res.data);
              });
            }}>
              Submit Review
            </Button>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ReviewPage;
