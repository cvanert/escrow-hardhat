export default function Escrow({
  address,
  arbiter,
  beneficiary,
  value,
  approved,
  handleApprove,
}) {

  if (approved) {
    return (
      <div className="existing-contract">
        <ul className="fields">
          <li>
            <div> Arbiter </div>
            <div> {arbiter} </div>
          </li>
          <li>
            <div> Beneficiary </div>
            <div> {beneficiary} </div>
          </li>
          <li>
            <div> Value </div>
            <div> {value} ETH </div>
          </li>
          <div className="complete" id="0xCba6b9A951749B8735C603e7fFC5151849248772">
            ✓ It's been approved!
          </div>
        </ul>
      </div>
    )
  }
  return (
    <div className="existing-contract">
      <ul className="fields">
        <li>
          <div> Arbiter </div>
          <div> {arbiter} </div>
        </li>
        <li>
          <div> Beneficiary </div>
          <div> {beneficiary} </div>
        </li>
        <li>
          <div> Value </div>
          <div> {value} ETH </div>
        </li>
        <div
          className="button"
          id={address}
          onClick={(e) => {
            e.preventDefault();

            handleApprove();
          }}
        >
          Approve
        </div>
      </ul>
    </div>
  );
}
